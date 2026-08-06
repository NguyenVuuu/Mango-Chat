import express from "express";
import {
  pinMessage,
  unpinMessage,
  getPinnedMessages,
} from "../controllers/pinnedMessageController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protectedRoute);

// Pin a message
router.post("/pin", pinMessage);

// Unpin a message
router.post("/unpin", unpinMessage);

// Get pinned messages for a conversation
router.get("/:conversationId", getPinnedMessages);

export default router;
