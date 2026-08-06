import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true, //bat buoc phai co gia tri
      unique: true, // khong duoc trung
      trim: true, // loai bo khoang trang
      lowerCase: true, // chuyen thanh chu thuong
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowerCase: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
    },
    avatarId: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    phone: {
      type: String,
      sparse: true, // cho phep null, nhung khong duoc trung
    },
    dateOfBirth: {
      type: Date,
    },
  },
  {
    timestamps: true, // tu dong them created_at va updated_at
  }
);

const User = mongoose.model("User", userSchema);
export default User;
