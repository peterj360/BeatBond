import express from "express";
import { getPlaylist } from "../controllers/spotify.js";

const router = express.Router();

router.get("/playlist/:playlistId", getPlaylist);

export default router;