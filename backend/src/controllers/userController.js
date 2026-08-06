import { uploadImageFromBuffer } from "../middlewares/uploadMiddleware.js";
import User from "../models/User.js";

export const authMe = async (req, res) => {
  try {
    const user = req.user; //lay tu authMiddleware

    return res.status(200).json(user);
  } catch (error) {
    console.log("loi khi goi auth me", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};

export const searchUsersByUsername = async (req, res) => {
  try {
    const { username } = req.query;
    console.log("username search", username);
    // kiem tra username co ton tai hay khong
    if (!username || username.trim() === "") {
      return res.status(400).json({ message: "username is required" });
    }

    // tim kiem user trong db va tra ve ket qua la thong tin gom _id, username, displayName, avatarUrl
    const user = await User.findOne({ username }).select(
      "_id username displayName avatarUrl "
    );
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.log(
      "loi khi goi search users by username trong userController",
      error
    );
    return res.status(500).json({ message: "loi he thong" });
  }
};

export const searchUsersByDisplayName = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({ message: "keyword is required" });
    }

    const users = await User.find({
      displayName: { $regex: keyword, $options: "i" },
    }).select("_id username displayName avatarUrl");

    return res.status(200).json({ users });
  } catch (error) {
    console.log(
      "loi khi goi search users by displayName trong userController",
      error
    );
    return res.status(500).json({ message: "loi he thong" });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user._id;

    if (!file) {
      return res.status(400).json({ message: "no file uploaded" });
    }
    const result = await uploadImageFromBuffer(file.buffer);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        avatarUrl: result.secure_url,
        avatarId: result.public_id,
      },
      {
        new: true,
      }
    ).select("avatarUrl");

    if (!updatedUser.avatarUrl) {
      return res.status(400).json({ message: "avatar null" });
    }

    return res.status(200).json({ avatarUrl: updatedUser.avatarUrl });
  } catch (error) {
    console.log("loi khi upload avatar trong userController", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { displayName, bio, phone, dateOfBirth } = req.body;

    // Validate input
    if (!displayName || displayName.trim() === "") {
      return res.status(400).json({ message: "displayName is required" });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        displayName: displayName.trim(),
        bio: bio ? bio.trim() : undefined,
        phone: phone ? phone.trim() : undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      },
      { new: true, runValidators: true }
    ).select("-hashedPassword");

    if (!updatedUser) {
      return res.status(404).json({ message: "user not found" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log("loi khi update profile trong userController", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};

// export const test = async (req, res) => {
//   return res.status(204);
// };
