import express from "express";
import verifyToken from "../middleware/auth.js";
import { deleteComment, likeComment } from "../controllers/comments.js";

const router = express.Router();

router.patch("/:id/like", verifyToken, likeComment);

router.delete("/:id", verifyToken, deleteComment);

export default router;