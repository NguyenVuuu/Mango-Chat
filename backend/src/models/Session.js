import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // lien ket den model User
      required: true,
      index: true,
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      //luu thoi gian het han cua refreshToken
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// tu dong xoa docu khi het han
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Session", sessionSchema);
