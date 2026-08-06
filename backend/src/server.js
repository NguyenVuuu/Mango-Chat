import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { v2 as cloudinary } from "cloudinary";

import { connectDB } from "./libs/db.js";
import { app, server } from "./socket/index.js";
import { protectedRoute } from "./middlewares/authMiddleware.js";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import friendRoute from "./routes/friendRoute.js";
import messageRoute from "./routes/messageRoute.js";
import conversationRoute from "./routes/conversationRoute.js";
import pinnedMessageRoute from "./routes/pinnedMessageRoutes.js";

//load cac bien moi truong
dotenv.config();

// const app = express();
const PORT = process.env.PORT || 5001;

//middlewares
//giup express doc duoc request body duoi dang json
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

//config cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//public route
app.use("/api/auth", authRoute);
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

//private route
app.use(protectedRoute);
app.use("/api/users", userRoute);
app.use("/api/friends", friendRoute);
app.use("/api/messages", messageRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/pinned-messages", pinnedMessageRoute);

connectDB().then(() => {
  // server.listen(PORT, () => {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`server run port: ${PORT}`);
  });
});
