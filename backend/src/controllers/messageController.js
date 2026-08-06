import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import {
  emitNewMessage,
  updateConversationAfterCreateMessage,
} from "../utils/messageHelper.js";
import { uploadImageFromBuffer } from "../middlewares/uploadMiddleware.js";
import { io } from "../socket/index.js";

export const sendDirectMessage = async (req, res) => {
  try {
    const {
      recipientId,
      content,
      imgUrl,
      conversationId,
      replyToId,
      replyToContent,
      replyToSenderName,
    } = req.body;
    const senderId = req.user._id;
    let conversation;
    if (!content && !imgUrl) {
      return res.status(400).json({ message: "thieu noi dung hoac hinh anh" });
    }
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    }
    if (!conversationId) {
      conversation = await Conversation.create({
        type: "direct",
        participants: [
          { userId: senderId, joinedAt: new Date() },
          { userId: recipientId, joinedAt: new Date() },
        ],
        lastMessageAt: new Date(),
        unreadCounts: new Map(),
      });
    }

    const messageData = {
      conversationId: conversation._id,
      senderId,
      content: content || null,
    };

    // Thêm imgUrl nếu có
    if (imgUrl) {
      messageData.imgUrl = imgUrl;
    }

    // Thêm replyTo nếu có
    if (replyToId && replyToContent && replyToSenderName) {
      messageData.replyTo = {
        _id: replyToId,
        content: replyToContent,
        senderName: replyToSenderName,
      };
    }

    const message = await Message.create(messageData);
    // cap nhat thong tin conversation
    updateConversationAfterCreateMessage(conversation, message, senderId);

    // luu thay doi
    await conversation.save();
    emitNewMessage(io, conversation, message);
    return res.status(201).json({ message });
  } catch (error) {
    console.error("loi xay ra khi gui tin nhan truc tiep");

    return res.status(500).json({ message: "loi he thong" });
  }
};
export const sendGroupMessage = async (req, res) => {
  try {
    const {
      conversationId,
      content,
      imgUrl,
      replyToId,
      replyToContent,
      replyToSenderName,
    } = req.body;
    const senderId = req.user._id;
    const conversation = req.conversation;

    if (!content && !imgUrl) {
      return res.status(400).json("thieu noi dung hoac hinh anh");
    }

    const messageData = {
      conversationId,
      senderId,
      content: content || null,
    };

    // Thêm imgUrl nếu có
    if (imgUrl) {
      messageData.imgUrl = imgUrl;
    }

    // Thêm replyTo nếu có
    if (replyToId && replyToContent && replyToSenderName) {
      messageData.replyTo = {
        _id: replyToId,
        content: replyToContent,
        senderName: replyToSenderName,
      };
    }

    const message = await Message.create(messageData);
    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();
    emitNewMessage(io, conversation, message);

    return res.status(201).json({ message });
  } catch (error) {
    console.error("loi xay ra khi gui tin nhan nhom", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    if (!messageId) {
      return res.status(400).json({ message: "thieu messageId" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "khong tim thay tin nhan" });
    }

    // Kiem tra xem user da xoa tin nhan nay chua
    const alreadyDeleted = message.deletedBy.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyDeleted) {
      return res.status(400).json({ message: "tin nhan da duoc xoa" });
    }

    // Them userId vao deletedBy array
    message.deletedBy.push(userId);
    await message.save();

    return res.status(200).json({ message: "xoa tin nhan thanh cong" });
  } catch (error) {
    console.error("loi khi xoa tin nhan", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};

export const recallMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    if (!messageId) {
      return res.status(400).json({ message: "thieu messageId" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "khong tim thay tin nhan" });
    }

    // Kiem tra xem user la nguoi gui tin nhan nay
    if (message.senderId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "ban khong co quyen thu hoi tin nhan nay" });
    }

    // Kiem tra xem tin nhan da duoc thu hoi chua
    if (message.isRecalled) {
      return res.status(400).json({ message: "tin nhan da duoc thu hoi" });
    }

    // Danh dau tin nhan la da thu hoi
    message.isRecalled = true;
    message.recalledAt = new Date();
    await message.save();

    // Emit socket event de cap nhat cho tat ca users
    io.to(message.conversationId.toString()).emit("message:recalled", {
      messageId: message._id,
      isRecalled: true,
      recalledAt: message.recalledAt,
    });

    return res.status(200).json({ message: "thu hoi tin nhan thanh cong" });
  } catch (error) {
    console.error("loi khi thu hoi tin nhan", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};

export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    if (!messageId || !emoji) {
      return res.status(400).json({ message: "thieu messageId hoac emoji" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "khong tim thay tin nhan" });
    }

    // Kiem tra xem user da react voi emoji nay chua
    const existingReaction = message.reactions.find(
      (r) => r.userId.toString() === userId.toString() && r.emoji === emoji
    );

    if (existingReaction) {
      // Neu da co thi xoa reaction
      message.reactions = message.reactions.filter(
        (r) => !(r.userId.toString() === userId.toString() && r.emoji === emoji)
      );
    } else {
      // Neu chua co thi them reaction
      message.reactions.push({
        emoji,
        userId,
      });
    }

    await message.save();

    // Emit socket event
    const conversation = await Conversation.findById(message.conversationId);
    io.to(message.conversationId.toString()).emit("message:reaction", {
      messageId: message._id,
      reactions: message.reactions,
    });

    return res.status(200).json({ message });
  } catch (error) {
    console.error("loi xay ra khi them reaction", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "khong co file duoc gui len" });
    }

    const result = await uploadImageFromBuffer(req.file.buffer, {
      folder: "mango_chat/img/messages",
      resource_type: "image",
    });

    return res.status(200).json({
      imgUrl: result.secure_url,
      message: "upload hinh anh thanh cong",
    });
  } catch (error) {
    console.error("loi khi upload hinh anh", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};
