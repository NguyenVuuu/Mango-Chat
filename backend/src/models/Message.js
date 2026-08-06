import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    emoji: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    _id: false,
    timestamps: true,
  }
);

const replyToSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    senderName: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation", //kieu du lieu la objid va tham chieu den model conversation
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    imgUrl: {
      type: String,
    },
    replyTo: {
      type: replyToSchema,
      default: null,
    },
    reactions: {
      type: [reactionSchema],
      default: [],
    },
    deletedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    isRecalled: {
      type: Boolean,
      default: false,
    },
    recalledAt: {
      type: Date,
      default: null,
    },
    messageType: {
      type: String,
      enum: ["user", "system"],
      default: "user",
    },
    systemMessageType: {
      type: String,
      enum: ["pin", "unpin"],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({
  conversationId: 1,
  createdAt: -1,
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
