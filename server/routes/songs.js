import express from "express";
import verifyToken from "../middleware/auth.js";
import { toggleLikeSong, deleteSong, getAllLikedSongs } from "../controllers/songs.js";

const router = express.Router();

router.put("/:id/like", verifyToken, toggleLikeSong);

router.delete("/:id", verifyToken, deleteSong);

router.get("/likedSongs", verifyToken, getAllLikedSongs);

export default router;