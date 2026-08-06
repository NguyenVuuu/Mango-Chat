import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  }
);

// chi duoc gui 1 request den 1 nguoi
friendRequestSchema.index(
  {
    from: 1,
    to: 1,
  },
  {
    unique: true,
  }
);

//truy van nhanh loi moi ket ban da gui
friendRequestSchema.index({
  from: 1,
});

//truy van nhanh loi moi ket ban da nhan
friendRequestSchema.index({
  to: 1,
});

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

export default FriendRequest;
