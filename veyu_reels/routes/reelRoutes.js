import express from "express";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  uploadReel,
  getReels,
  deleteReel,
  toggleLike,
  addComment,
  getComments,
} from "../controllers/reelController.js";

const router = express.Router();

// Reels
router.post("/upload", auth, upload.single("video"), uploadReel);
router.get("/", getReels);
router.delete("/:id", auth, deleteReel);

// Likes
router.put("/:id/like", auth, toggleLike); // toggle like/unlike

// Comments
router.post("/:id/comment", auth, addComment);
router.get("/:id/comments", getComments);

export default router;
