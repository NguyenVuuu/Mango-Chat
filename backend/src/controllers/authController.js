import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Session from "../models/Session.js";

const ACCESS_TOKEN_TTL = "15m"; // 15 phút
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;
    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    //0.kiem tra user co ton tai chua
    const duplicate = await User.findOne({ username });
    if (duplicate) {
      return res.status(409).json({ message: "User already exists" });
    }
    //1.neu chua thi ma hoa pwd
    const hashedPassword = await bcrypt.hash(password, 10); // 10 la so lan ma brypt ma hoa lap di lap lai
    //2.tao user moi
    await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${firstName} ${lastName}`,
    });

    return res.sendStatus(204);
  } catch (error) {
    console.log("loi khi goi signup", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};

export const signIn = async (req, res) => {
  try {
    //1. lay input tu req body (username, password ma user gui )
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "thieu username hoac password" });
    }
    //2. lay hashpwd duoc luu trong dbs de so sanh voi pwd ma nguoi dung vua nhap (giong nhau la xac thuc thanh cong)
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "sai username hoac password" });
    }
    //2.1 kiem tra pwd
    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordCorrect) {
      return res.status(401).json({ message: "sai username hoac password" });
    }
    //3. neu khop tao access token voi jwt
    const accessToken = jwt.sign(
      {
        userId: user._id, //luu userid de server biet ai dang gui req
      },
      process.env.ACCESS_TOKEN_SECRET, //ma hoa token
      {
        expiresIn: ACCESS_TOKEN_TTL, // thoi gian token co hieu luc
      }
    );

    //4. tao refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");
    //5. tao session de luu refresh token vao dbs
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    //6. gui refresh token ve client thong qua cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none", // cho phep be va fe deploy rieng
      maxAge: REFRESH_TOKEN_TTL,
    });
    //7. gui access token ve response
    return res.status(200).json({
      message: `User ${user.displayName} log in thanh cong`,
      accessToken,
    });
  } catch (error) {
    console.log("loi khi goi sign in", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};

export const signOut = async (req, res) => {
  try {
    //1. lay refresh token tu cookie
    const token = req.cookies?.refreshToken;
    if (token) {
      //2. xoa refresh token trong session
      await Session.deleteOne({ refreshToken: token });

      //3. xoa refresh token trong cookie
      res.clearCookie("refreshToken");
    }
    return res.sendStatus(204);
  } catch (error) {
    console.log("loi khi goi sign out", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};

//tao access token moi tu refresh token
export const refreshToken = async (req, res) => {
  try {
    // 1. lay refresh token tu cookie
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "token khong ton tai" });
    }
    //2. so sanh voi refresh token trong dbs
    const session = await Session.findOne({ refreshToken: token });
    if (!session) {
      return res.stats(403).json({ message: "token khong hop le" });
    }
    //3. kiem tra xem token het han chua
    if (session.expiresAt < new Date()) {
      return res.status(403).json({ message: "token da het han" });
    }
    //3.1 neu chua het han va hop le thi tao access token moi
    const accessToken = jwt.sign(
      {
        userId: session.userId,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );
    //4. tra ve access token moi cho client trong return
    return res.status(200).json({
      accessToken,
    });
  } catch (error) {
    console.error("loi khi goi refresh token at authControll", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};

//loi thi tra ve status 500, thanh cong thi tra ve 204
