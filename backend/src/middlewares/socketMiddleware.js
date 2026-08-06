import jwt from "jsonwebtoken";
import User from "../models/User.js";
export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("socketMiddleware: token khong ton tai"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded) {
      return next(
        new Error("socketMiddleware: token khong hop le hoac da het han")
      );
    }

    //tim user theo decoded userId
    const user = await User.findById(decoded.userId).select("-hashedPassword");

    if (!user) {
      return next(new Error("socketMiddleware: user khong ton tai"));
    }

    socket.user = user;

    next();
  } catch (error) {
    console.error("loi khi verify jwt trong socketMiddleware", error);
    next(new Error("socketMiddleware: loi he thong"));
  }
};
