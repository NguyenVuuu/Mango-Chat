import express from "express";
import {
  authMe,
  searchUsersByDisplayName,
  searchUsersByUsername,
  uploadAvatar,
  updateProfile,
} from "../controllers/userController.js";

import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/me", authMe);
router.get("/search", searchUsersByUsername);
router.get("/searchs", searchUsersByDisplayName);
router.post("/uploadAvatar", upload.single("file"), uploadAvatar);
router.patch("/profile", updateProfile);
// router.get("/test", test);

export default router;
