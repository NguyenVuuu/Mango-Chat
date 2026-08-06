import Friend from "../models/Friend.js";
import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import Conversation from "../models/Conversation.js";

export const sendFriendRequest = async (req, res) => {
  try {
    console.log("=== SEND FRIEND REQUEST DEBUG ===");
    console.log("Request body:", req.body);
    console.log("User from token:", req.user?._id);
    console.log("Headers:", req.headers.authorization);

    const { to, message } = req.body;

    console.log("Extracted values - to:", to, "message:", message);

    if (!to) {
      console.log("Missing 'to' field in request body");
      return res.status(400).json({
        message: "Thiếu thông tin người nhận lời mời",
      });
    }

    //nguoi dung dang login
    const from = req.user._id;

    //tranh viec nguoi dung gui ket ban cho chinh minh
    if (from === to) {
      return res.status(400).json({
        message: "khong the gui ket ban cho chinh minh",
      });
    }

    //tranh viec gui ket ban cho nguoi khong ton tai
    const userExists = await User.exists({ _id: to });
    if (!userExists) {
      return res.status(404).json({
        message: "nguoi dung khong ton tai",
      });
    }

    let userA = from.toString();
    let userB = to.toString();

    if (userA > userB) {
      //doi vi tri
      [userA, userB] = [userB, userA];
    }

    //chay song song 2 truy van 1 luc
    const [alreadyFriends, existingRequest] = await Promise.all([
      // kiem tra xem 2 nguoi da la ban chua
      Friend.findOne({
        userA,
        userB,
      }),
      // kiem tra xem 1 trong 2 da gui ket ban cho nhau chua
      // FriendRequest.findOne[({ from, to }, { from: to, to: from })],
      FriendRequest.findOne({
        $or: [
          { from, to },
          { from: to, to: from },
        ],
      }),
    ]);

    if (alreadyFriends) {
      return res.status(400).json({
        message: "2 nguoi da la ban be",
      });
    }

    if (existingRequest) {
      return res.status(400).json({
        message: "da co loi moi ket ban dang cho",
      });
    }

    //neu da co 1 trong 2 alreadyFriend va existingRequest thi 0 tao request
    //chua co ca 2 thi tao request

    const request = await FriendRequest.create({
      from,
      to,
      message,
    });

    return res.status(200).json({
      message: "gui ket ban thanh cong",
      request,
    });
  } catch (error) {
    console.error("loi gui yeu cau ket ban o friendController", error);
    return res.status(500).json({
      message: "loi he thong",
    });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    //id cua nguoi dung dang login
    const userId = req.user._id;

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        message: "khong tim thay loi moi ket ban",
      });
    }

    //dam bao chi nguoi nhan moi duoc quyen chap nhan
    if (request.to.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "ban khong co quyen chap nhan loi moi addfr nay",
      });
    }

    // tao quan he ban be moi
    const friend = await Friend.create({
      userA: request.from,
      userB: request.to,
    });
    //sau khi thanh friend thi xoa requestFriend
    await FriendRequest.findByIdAndDelete(requestId);

    //lay cac thong tin can thiet cua ban moi de hien thi ra UI
    const from = await User.findById(request.from)
      .select("_id displayName avatarUrl")
      .lean(); // lean de tra ve javascript object thay vi tra ve document

    return res.status(200).json({
      message: "chap nhan ket ban thanh cong",
      newFriend: {
        _id: from?._id,
        displayName: from?.displayName,
        avatarUrl: from?.avatarUrl,
      },
    });
  } catch (error) {
    console.error("loi chap nhan ket ban o friendController", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    //lay id cua loi moi ket ban tu url params ma client gui len
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        message: "khong tim thay loi moi ket ban",
      });
    }
    if (request.to.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "ban khong co quyen tu choi loi moi addfr nay",
      });
    }

    await FriendRequest.findByIdAndDelete(requestId);

    return res.sendStatus(204);
  } catch (error) {
    console.error("loi khi tu choi ket ban o friendController", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};

export const getAllFriends = async (req, res) => {
  try {
    const userId = req.user._id;
    const friendships = await Friend.find({
      $or: [
        {
          userA: userId,
        },
        { userB: userId },
      ],
    })
      .populate("userA", "_id displayName avatarUrl username")
      .populate("userB", "_id displayName avatarUrl username")
      .lean();

    if (!friendships.length) {
      return res.status(200).json({ friends: [] });
    }

    const friends = friendships.map((f) =>
      f.userA._id.toString() === userId.toString() ? f.userB : f.userA,
    );

    return res.status(200).json({ friends });
  } catch (error) {
    console.error("loi khi lay all friend o friendController", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    //danh sach cac field ma minh muon lay ra khi populate
    const populateFields = "_id displayName avatarUrl username";

    const [sent, received] = await Promise.all([
      // lay ra danh sach loi moi ket ban ma minh gui di
      FriendRequest.find({ from: userId }).populate("to", populateFields),
      // lay ra danh sach loi moi ket ban ma minh nhan duoc
      FriendRequest.find({ to: userId }).populate("from", populateFields),
    ]);
    res.status(200).json({ sent, received });
  } catch (error) {
    console.error("loi khi lay all friend request o friendController", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};

// Lấy danh sách bạn chung giữa hai người dùng
export const getMutualFriends = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (!userId) {
      return res.status(400).json({
        message: "userId là bắt buộc",
      });
    }

    // Lấy danh sách bạn của user hiện tại
    const myFriendships = await Friend.find({
      $or: [{ userA: currentUserId }, { userB: currentUserId }],
    }).lean();

    const myFriendIds = myFriendships.map((f) =>
      f.userA.toString() === currentUserId.toString() ? f.userB : f.userA,
    );

    // Lấy danh sách bạn của user khác
    const otherFriendships = await Friend.find({
      $or: [{ userA: userId }, { userB: userId }],
    }).lean();

    const otherFriendIds = otherFriendships.map((f) =>
      f.userA.toString() === userId.toString() ? f.userB : f.userA,
    );

    // Tìm bạn chung
    const mutualFriendIds = myFriendIds.filter((id) =>
      otherFriendIds.some((otherId) => otherId.toString() === id.toString()),
    );

    // Lấy thông tin chi tiết của bạn chung
    const mutualFriends = await User.find(
      { _id: { $in: mutualFriendIds } },
      "_id displayName avatarUrl",
    ).lean();

    return res.status(200).json({
      mutualFriends,
      count: mutualFriends.length,
    });
  } catch (error) {
    console.error("loi khi lay mutual friends", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};

// Lấy danh sách nhóm chung giữa hai người dùng
export const getMutualGroups = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (!userId) {
      return res.status(400).json({
        message: "userId là bắt buộc",
      });
    }

    // Lấy danh sách nhóm của user hiện tại
    const myGroups = await Conversation.find({
      type: "group",
      "participants.userId": currentUserId,
    })
      .select("_id group.name")
      .lean();

    const myGroupIds = myGroups.map((g) => g._id);

    // Lấy danh sách nhóm của user khác
    const otherGroups = await Conversation.find({
      type: "group",
      "participants.userId": userId,
    })
      .select("_id group.name")
      .lean();

    const otherGroupIds = otherGroups.map((g) => g._id);

    // Tìm nhóm chung
    const mutualGroupIds = myGroupIds.filter((id) =>
      otherGroupIds.some((otherId) => otherId.toString() === id.toString()),
    );

    // Lấy thông tin chi tiết của nhóm chung
    const mutualGroups = await Conversation.find(
      { _id: { $in: mutualGroupIds } },
      "_id group.name",
    ).lean();

    return res.status(200).json({
      mutualGroups,
      count: mutualGroups.length,
    });
  } catch (error) {
    console.error("loi khi lay mutual groups", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};
