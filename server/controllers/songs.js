import User from "../models/user.js";
import Song from "../models/song.js";
import Playlist from "../models/playlist.js"
import fs from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const toggleLikeSong = async (req, res) => {
    try {
        const songId = req.params.id;

        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(400).json({ message: "Song not found"});
        }

        const userId = req.user.id;

        const user = await User.findById(userId).populate('likedSongs').exec();

        if (!user) {
            return res.status(400).json({ message: "User not found"});
        }

        const likedSongsPlaylist = await Playlist.findById(user.likedSongs._id).exec();

        if (!likedSongsPlaylist) {
            return res.status(400).json({ message: "Liked Songs playlist not found" });
        }

        const index = likedSongsPlaylist.songs.indexOf(song._id);

        let message;

        if (index === -1) {
            likedSongsPlaylist.songs.push(songId);
            message = "Added to your liked songs";
        } else {
            likedSongsPlaylist.songs.splice(index, 1);
            message = "Removed from your liked songs";
        }

        await likedSongsPlaylist.save();

        res.status(200).json({ message: message });
    } catch (error) {
        console.error("Error toggling like status", error);
        res.status(500).json({ message: error.message });
    }
}

export const getAllLikedSongs = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).populate([
            {
              path: 'likedSongs',
              populate: [
                { path: 'songs' },
                { path: 'user' }
              ]
            }
          ]).exec();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const likedSongs = user.likedSongs

        res.status(200).json({ message: likedSongs.songs.length > 0 ? "Liked songs fetched successfully" : "No liked songs found", likedSongs });
    } catch (error) {
        console.error("Error fetching liked songs", error);
        res.status(500).json({ message: error.message });
    }
}

export const deleteSong = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const song = await Song.findById(id);

        if (!song) {
            return res.status(404).json({ message: "Song not found"});
        }

        if (song.filePath) {
            const absoluteFilePath = path.resolve(__dirname, '..', '..', 'public', 'assets', song.filePath);
            try {
                await fs.unlink(absoluteFilePath);
            } catch (err) {
                console.error(`Failed to delete file at ${absoluteFilePath}`, err);
            }
        }

        if (song.picturePath) {
            const absolutePicturePath = path.resolve(__dirname, '..', '..', 'public', 'assets', song.picturePath);
            try {
                await fs.unlink(absolutePicturePath);
            } catch (err) {
                console.error(`Failed to delete file at ${absolutePicturePath}`, err);
            }
        }

        await User.updateOne(
            { _id: userId, songs: id},
            { $pull: { songs: id } }
        );

        await Playlist.updateMany(
            { songs: id },
            { $pull: { songs: id } }
        );

        await Song.deleteOne({ _id: id });
    
        res.status(200).json({ message: "Song deleted succesfully"});
    } catch (error) {
        console.error("Error deleting song", error);
        res.status(500).json({ message: error.message });
    }
}