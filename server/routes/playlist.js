import express from "express";
import verifyToken from "../middleware/auth.js";
import { addSong, createPlaylist, deletePlaylist, getAllPlaylists, getPlaylist, removeSong, togglePrivacy } from "../controllers/playlist.js";

const router = express.Router();

router.post("/", verifyToken, createPlaylist);

router.get("/:playlistId", verifyToken, getPlaylist);

router.get("/", verifyToken, getAllPlaylists);

router.put("/:playlistId/add-song", verifyToken, addSong);

router.put("/:playlistId/remove-song", verifyToken, removeSong);

router.put("/:playlistId/togglePrivacy", verifyToken, togglePrivacy);

router.delete("/:playlistId", verifyToken, deletePlaylist);

export default router;