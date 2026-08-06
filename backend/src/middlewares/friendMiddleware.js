import Conversation from "../models/Conversation.js";
import Friend from "../models/Friend.js";

//hoan doi a va b neu a > b
const pair = (a, b) => (a < b ? [a, b] : [b, a]);

export const checkFriendship = async (req, res, next) => {
  try {
    // id cua user dang login
    const me = req.user._id.toString();
    const recipientId = req.body?.recipientId ?? null;
    //    // logic chi cho phep tao nhom voi ban be
    const memberIds = req.body?.memberIds ?? [];

    if (!recipientId && memberIds.length === 0) {
      return res.status(400).json({
        message:
          "can cung cap recipientId hoac memberIds cho friendship middleware",
      });
    }

    if (recipientId) {
      const [userA, userB] = pair(me, recipientId);

      const isFriend = await Friend.findOne({ userA, userB });

      if (!isFriend) {
        return res.status(403).json({
          message: "ban chua ket ban voi nguoi nay",
        });
      }

      return next();
    }

    // // logic chi cho phep tao nhom voi ban be
    const friendChecks = memberIds.map(async (memberId) => {
      const [userA, userB] = pair(me, memberId);
      const friend = await Friend.findOne({ userA, userB });
      return friend ? null : memberId;
    });

    const result = await Promise.all(friendChecks);
    const notFriends = result.filter(Boolean);
    if (notFriends.length > 0) {
      return res.status(403).json({
        message: "chi co the them ban be vao nhom",
        notFriends,
      });
    }
    next();
  } catch (error) {
    console.error("loi khi middleware friendship", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};

export const checkGroupMembership = async (req, res, next) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(403).json({
        message: "khong tim thay duoc cuoc tro chuyen",
      });
    }
    const isMember = conversation.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );
    req.conversation = conversation;
    next();
  } catch (error) {
    console.error("loi checkgroup membership", error);
    return res.status(500).json({
      message: "loi he thong",
    });
  }
};
