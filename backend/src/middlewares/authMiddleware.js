import jwt, { decode } from "jsonwebtoken";
import User from "../models/User.js";

export const protectedRoute = (req, res, next) => {
  try {
    console.log("=== AUTH MIDDLEWARE DEBUG ===");
    console.log("Request URL:", req.url);
    console.log("Request method:", req.method);
    
    //1. lay access token ma client gui len req header
    const authHeader = req.headers["authorization"]; //lay ra phan authorization trong req header ma client gui len
    console.log("Auth header:", authHeader);
    
    const token = authHeader && authHeader.split(" ")[1]; // neu co auth header thi tach chuoi boi dau " ". sau khi tach thi "Bearer" nam o vi tri 1 va phan token that su thi nam o vi tri 2
    console.log("Extracted token:", token ? "Present" : "Missing");

    if (!token) {
      console.log("No token found, returning 401");
      return res.status(401).json({ message: "khong tim thay access token" });
    }
    //2. kiem tra token hop le hay khong
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, decodedUser) => {
        if (err) {
          console.error(err);
          return res
            .status(403)
            .json({ message: "access token het han hoac khong dung" });
        }
        //3. neu token hop le tim user tuong ung trong dbs de chac chan userId la that
        const user = await User.findById(decodedUser.userId).select(
          "-hashedPassword"
        ); //lay all inform tru mat khau
        if (!user) {
          return res.status(404).json({ message: "nguoi dung khong ton tai" });
        }
        //4. gan thong tin user vao req
        req.user = user;
        next();
      }
    );
  } catch (error) {
    console.log("loi khi xac minh jwt trong middlewares", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};
