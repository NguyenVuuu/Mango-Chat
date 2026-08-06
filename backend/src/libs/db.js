import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
    console.log("connect dbs success");
  } catch (error) {
    console.log("connect dbs fail", error);
    process.exit(1);
  }
};
