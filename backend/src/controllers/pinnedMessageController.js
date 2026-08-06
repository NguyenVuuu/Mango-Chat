import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { io } from "../socket/index.js";

// Pin a message
export const pinMessage = async (req, res) => {
  try {
    const { conversationId, messageId } = req.body;
    const userId = req.user._id;

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Check if message exists and belongs to this conversation
    const message = await Message.findOne({
      _id: messageId,
      conversationId: conversationId,
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if message is already pinned
    const isAlreadyPinned = conversation.pinnedMessages.some(
      (pin) => pin.messageId.toString() === messageId
    );

    if (isAlreadyPinned) {
      return res.status(400).json({ error: "Message is already pinned" });
    }

    // Add to pinned messages
    conversation.pinnedMessages.push({
      messageId,
      pinnedBy: userId,
      pinnedAt: new Date(),
    });

    await conversation.save();

    // Create system message
    const systemMessage = new Message({
      conversationId,
      senderId: userId,
      content: `đã ghim một tin nhắn`,
      messageType: "system",
      systemMessageType: "pin",
    });

    await systemMessage.save();

    // Populate system message with sender info
    await systemMessage.populate("senderId", "displayName avatar");

    // Get updated pinned messages with populated data
    const updatedConversation = await Conversation.findById(conversationId)
      .populate({
        path: "pinnedMessages.messageId",
        populate: {
          path: "senderId",
          select: "displayName avatar",
        },
      })
      .populate("pinnedMessages.pinnedBy", "displayName avatar");

    // Emit to all participants in the conversation
    io.to(conversationId).emit("message-pinned", {
      conversationId,
      pinnedMessages: updatedConversation.pinnedMessages,
      systemMessage,
    });

    res.status(200).json({
      message: "Message pinned successfully",
      pinnedMessages: updatedConversation.pinnedMessages,
      systemMessage,
    });
  } catch (error) {
    console.error("Error pinning message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Unpin a message
export const unpinMessage = async (req, res) => {
  try {
    const { conversationId, messageId } = req.body;
    const userId = req.user._id;

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Check if message is pinned
    const pinnedIndex = conversation.pinnedMessages.findIndex(
      (pin) => pin.messageId.toString() === messageId
    );

    if (pinnedIndex === -1) {
      return res.status(400).json({ error: "Message is not pinned" });
    }

    // Remove from pinned messages
    conversation.pinnedMessages.splice(pinnedIndex, 1);
    await conversation.save();

    // Create system message
    const systemMessage = new Message({
      conversationId,
      senderId: userId,
      content: `đã bỏ ghim một tin nhắn`,
      messageType: "system",
      systemMessageType: "unpin",
    });

    await systemMessage.save();

    // Populate system message with sender info
    await systemMessage.populate("senderId", "displayName avatar");

    // Get updated pinned messages with populated data
    const updatedConversation = await Conversation.findById(conversationId)
      .populate({
        path: "pinnedMessages.messageId",
        populate: {
          path: "senderId",
          select: "displayName avatar",
        },
      })
      .populate("pinnedMessages.pinnedBy", "displayName avatar");

    // Emit to all participants in the conversation
    io.to(conversationId).emit("message-unpinned", {
      conversationId,
      pinnedMessages: updatedConversation.pinnedMessages,
      systemMessage,
    });

    res.status(200).json({
      message: "Message unpinned successfully",
      pinnedMessages: updatedConversation.pinnedMessages,
      systemMessage,
    });
  } catch (error) {
    console.error("Error unpinning message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get pinned messages for a conversation
export const getPinnedMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
    })
      .populate({
        path: "pinnedMessages.messageId",
        populate: {
          path: "senderId",
          select: "displayName avatar",
        },
      })
      .populate("pinnedMessages.pinnedBy", "displayName avatar");

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Sort pinned messages by pinnedAt (newest first)
    const sortedPinnedMessages = conversation.pinnedMessages.sort(
      (a, b) => new Date(b.pinnedAt) - new Date(a.pinnedAt)
    );

    res.status(200).json({
      pinnedMessages: sortedPinnedMessages,
    });
  } catch (error) {
    console.error("Error getting pinned messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};