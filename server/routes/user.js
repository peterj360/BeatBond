import express from "express";
import { getUser, getUserFollowers, getUserFollowing, followUser, unfollowUser, removeFollower, getUserBySongId, getRecommendedUsers } from "../controllers/user.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

router.get("/recommended", verifyToken, getRecommendedUsers);

router.get("/:id", verifyToken, getUser);

router.get("/:id/followers", verifyToken, getUserFollowers);

router.get("/:id/following", verifyToken, getUserFollowing);

router.get("/song/:songId", verifyToken, getUserBySongId);

router.post("/:id/follow/:targetUserId", verifyToken, followUser);

router.delete("/:id/follow/:targetUserId", verifyToken, unfollowUser);

router.patch("/:id/remove/:targetUserId", verifyToken, removeFollower);

export default router;