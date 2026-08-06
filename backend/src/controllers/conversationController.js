import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { io } from "../socket/index.js";

export const createConversation = async (req, res) => {
  try {
    const { type, name, memberIds } = req.body;
    const userId = req.user._id;

    if (
      !type ||
      // la nhom ma khong co ten
      (type === "group" && !name) ||
      // memberIds khong ton tai
      !memberIds ||
      //memberids khong phai 1 mang
      !Array.isArray(memberIds) ||
      //mang memberIds rong
      memberIds.length === 0
    ) {
      return res.status(400).json({
        message: "ten nhom va danh sach thanh vien la bat buoc",
      });
    }
    let conversation;

    if (type === "direct") {
      //lay participantId tu phan tu dau tien cua memberIds
      const participantId = memberIds[0];

      conversation = await Conversation.findOne({
        type: "direct",
        "participants.userId": { $all: [userId, participantId] },
      });

      if (!conversation) {
        conversation = new Conversation({
          type: "direct",
          participants: [{ userId }, { userId: participantId }],
          lastMessageAt: new Date(),
        });
        await conversation.save();
      }
    }
    if (type === "group") {
      conversation = new Conversation({
        type: "group",
        participants: [{ userId }, ...memberIds.map((id) => ({ userId: id }))],
        group: {
          name,
          createdBy: userId,
        },
        lastMessageAt: new Date(),
      });
      await conversation.save();
    }
    //kiem tra lai xem conversation co gia tri chua
    if (!conversation) {
      return res.status(400).json({
        message: "conversation type khong phai la direct hoac group",
      });
    }

    //neu coversation da tao thi goi populate de nap cac thong tin cho user
    await conversation.populate([
      //lay displayName va avartar cua nguoi tham gia trong truong participants
      { path: "participants.userId", select: "displayName avatarUrl" },
      //hien thi displayName va avartar cua nguoi da xem tin nhan
      { path: "seenBy", select: "displayName avatarUrl" },
      //hien thi displayName va avartar cua nguoi gui tin nhan cuoi cung
      { path: "lastMessage.senderId", select: "displayName avatarUrl" },
    ]);

    const participants = (conversation.participants || []).map((p) => ({
      _id: p.userId?._id,
      displayName: p.userId?.displayName,
      avatarUrl: p.userId?.avatarUrl ?? null,
      joinedAt: p.joinedAt,
    }));

    const formatted = { ...conversation.toObject(), participants };

    if (type === "group") {
      memberIds.forEach((userId) => {
        io.to(userId).emit("new-group", formatted);
      });
    }

    return res.status(201).json({
      conversation: formatted,
    });
  } catch (error) {
    console.error("loi khi tao conversation", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({
      "participants.userId": userId,
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate({
        path: "participants.userId",
        select: "displayName avatarUrl",
      })
      .populate({
        path: "lastMessage.senderId",
        select: "displayName avatarUrl",
      })
      .populate({
        path: "seenBy",
        select: "displayName avatarUrl",
      })
      .populate({
        path: "pinnedMessages.messageId",
        populate: {
          path: "senderId",
          select: "displayName avatarUrl",
        },
      })
      .populate({
        path: "pinnedMessages.pinnedBy",
        select: "displayName avatarUrl",
      });

    const formatted = conversations.map((conver) => {
      const participants = (conver.participants || []).map((p) => ({
        _id: p.userId?._id,
        displayName: p.userId?.displayName,
        avatarUrl: p.userId?.avatarUrl ?? null,
        joinedAt: p.joinedAt,
      }));

      // Sort pinned messages by pinnedAt (newest first)
      const sortedPinnedMessages = (conver.pinnedMessages || []).sort(
        (a, b) => new Date(b.pinnedAt) - new Date(a.pinnedAt)
      );

      return {
        //toObject de chuyen mongoose docu thanh js
        ...conver.toObject(),
        unreadCounts: conver.unreadCounts || {},
        participants,
        pinnedMessages: sortedPinnedMessages,
      };
    });
    return res.status(200).json({
      conversations: formatted,
    });
  } catch (error) {
    console.error("loi xay ra khi lay conversations", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    //cursor: con tro dung de danh dau vi tri phan trang
    //dung thoi gian tao cua tin nhan lam con tro
    //moi lan can lay them thi query nhung tin nhan cu hon tin cuoi cung dang co
    const { limit = 50, cursor } = req.query;

    const query = { conversationId };

    //neu co cursor nghia la dang load tin nhan cu
    // thi can query nhung tin cu hon moc thoi diem hien tai
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }
    let messages = await Message.find(query)
      .sort({
        createdAt: -1,
      })
      .limit(Number(limit) + 1)
      .populate("senderId", "displayName avatarUrl")
      .populate("replyTo._id", "content senderId createdAt")
      .populate({
        path: "replyTo._id",
        populate: {
          path: "senderId",
          select: "displayName avatarUrl",
        },
      });

    let nextCursor = null;
    /*
    vi du khi dat limit=50 nhung query duoc 51 message
    nghia la van con tin nhan sau do.
    Nen lay thoi gian tao cua mess 51 lam next Cursor
    */
    if (messages.length > Number(limit)) {
      const nextMessage = messages[messages.length - 1];
      nextCursor = nextMessage.createdAt.toISOString();
      messages.pop();
    }
    //dao nguoc thu tu sau khi sort
    messages = messages.reverse();

    return res.status(200).json({
      messages,
      nextCursor,
    });
  } catch (error) {
    console.error("loi xay ra khi lay messages", error);
    return res.status(500).json({
      message: "loi he thong",
    });
  }
};

export const getUserConversationsForSocket = async (userId) => {
  try {
    const conversations = await Conversation.find(
      {
        "participants.userId": userId,
      },
      { _id: 1 }
    );
    return conversations.map((c) => c._id.toString());
  } catch (error) {
    console.error("loi xay ra khi fetch conversations", error);
    return [];
  }
};

export const markAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();

    const conversation = await Conversation.findById(conversationId).lean();

    if (!conversation) {
      return res.status(404).json({
        message: "khong tim thay conversation",
      });
    }

    const last = conversation.lastMessage;
    if (!last) {
      return res.status(200).json({
        message: "khong co tin nhan cuoi cung",
      });
    }

    if (last.senderId.toString() === userId) {
      return res.status(200).json({
        message: "nguoi gui khong can mark as seen",
      });
    }

    // danh dau da doc
    //1. them userId vao mang seenBy neu chua co
    //2. dat so luong tin nhan chua doc cua user do ve 0
    const updated = await Conversation.findByIdAndUpdate(
      conversationId, // tim coversation theo id
      {
        $addToSet: { seenBy: userId },
        $set: { [`unreadCounts.${userId}`]: 0 },
      },
      {
        new: true, // tra ve docu sau khi cap nhat
      }
    );

    io.to(conversationId).emit("read-message", {
      conversation: updated,
      lastMessage: {
        _id: updated?.lastMessage._id,
        content: updated?.lastMessage.content,
        createdAt: updated?.lastMessage.createdAt,
        sender: {
          _id: updated?.lastMessage.senderId,
        },
      },
    });
    return res.status(200).json({
      message: "Marked as seen",
      seenBy: updated?.seenBy || [],
      myUnreadCount: updated?.unreadCounts[userId] || 0,
    });
  } catch (error) {
    console.error("loi xay ra khi mark as seen", error);
    return res.status(500).json({
      message: "loi he thong",
    });
  }
};
