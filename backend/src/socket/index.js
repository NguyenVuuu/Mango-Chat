import { Server } from "socket.io";
import http from "http";
import express from "express";
import { socketAuthMiddleware } from "../middlewares/socketMiddleware.js";
import { getUserConversationsForSocket } from "../controllers/conversationController.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});
io.use(socketAuthMiddleware);

// xu ly onl/off của user
const onlineUsers = new Map(); //{key: userId, value: socketId}
io.on("connection", async (socket) => {
  const user = socket.user;
  console.log(`${user.displayName} online voi socket id ${socket.id}`);

  //bao danh userId online vao trong onlineUsers
  onlineUsers.set(user._id, socket.id);

  //thong bao tat ca client biet user vua online
  io.emit("online-users", Array.from(onlineUsers.keys()));

  const conversationsIds = await getUserConversationsForSocket(user._id);
  conversationsIds.forEach((id) => {
    socket.join(id);
  });

  //join room conver sau khi tao moi o fe
  socket.on("join-conversation", (conversationId) => {
    socket.join(conversationId);
  });

  //join room user de nhan thong bao khi co tin nhan moi
  socket.join(user._id.toString());

  socket.on("disconnect", () => {
    //xoa userId khoi map onlineUsers
    onlineUsers.delete(user._id);
    //thong bao tat ca client biet user vua offline
    io.emit("online-users", Array.from(onlineUsers.keys()));
    console.log(`socket disconnect: ${socket.id}`);
  });
});

export { io, app, server };
