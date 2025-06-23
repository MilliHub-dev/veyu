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

/**
 * @swagger
 * tags:
 *   name: Reels
 *   description: API for managing reels (upload, like, comment, delete)
 */

/**
 * @swagger
 * /reels:
 *   get:
 *     summary: Get all reels
 *     tags: [Reels]
 *     responses:
 *       200:
 *         description: List of reels
 */

/**
 * @swagger
 * /reels/upload:
 *   post:
 *     summary: Upload a new reel
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *               description:
 *                 type: string
 *               vehicleType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reel uploaded successfully
 */

/**
 * @swagger
 * /reels/{id}/like:
 *   put:
 *     summary: Like or unlike a reel
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: Like toggled successfully
 */

/**
 * @swagger
 * /reels/{id}/comment:
 *   post:
 *     summary: Add a comment to a reel
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reel ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 */

/**
 * @swagger
 * /reels/{id}/comments:
 *   get:
 *     summary: Get all comments for a reel
 *     tags: [Reels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: List of comments
 */

/**
 * @swagger
 * /reels/{id}:
 *   delete:
 *     summary: Delete a reel
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: Reel deleted
 *       403:
 *         description: Not authorized
 */
