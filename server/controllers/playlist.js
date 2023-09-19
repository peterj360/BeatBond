import User from "../models/user.js";
import Song from "../models/song.js";
import Playlist from "../models/playlist.js"
import mongoose from "mongoose";

export const createPlaylist = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);

        const playlistCount = user.playlists.length;

        const newPlaylist = new Playlist({
            name: `My Playlist #${playlistCount + 1}`,
            user: userId,
            picturePath: "default-playlist.png",
        });

        await newPlaylist.save();

        await User.findByIdAndUpdate(
            userId,
            { $push: { playlists: newPlaylist._id } },
            { useFindAndModify: false }
        );

        const populatedPlaylist = await Playlist.populate(newPlaylist, {path: 'user'});

        res.status(201).json({ message: "Playlist created successfully", playlist: populatedPlaylist });
    } catch (error) {
        console.error("Error creating playlist", error);
        res.status(500).json({ message: error.message });
    }
}

export const getPlaylist = async (req, res) => {
    try {
        const userId = req.user.id;
        const playlistId = req.params.playlistId;

        const playlist = await Playlist.findById(playlistId).populate('songs').populate('user').exec();

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        if (playlist.privacy === "private" && playlist.user.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to view this playlist" });
        }

        res.status(200).json({ message: "Playlist fetched successfully", playlist: playlist });
    } catch (error) {
        console.error("Error fetching playlist", error);
        res.status(500).json({ message: error.message });
    }
}

export const getAllPlaylists = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).populate({
            path: 'playlists',
            populate: {
                path: 'user'
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Playlists fetched successfully", playlists: user.playlists });
    } catch (error) {
        console.error("Error fetching playlists", error);
        res.status(500).json({ message: error.message });
    }
}

export const addSong = async (req, res) => {
    try {
        const playlistId = req.params.playlistId;
        const { songId } = req.body;

        if (!mongoose.isValidObjectId(songId) || !mongoose.isValidObjectId(playlistId)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        const song = await Song.findById(songId);
        if (!song) {
            return res.status(404).json({ message: 'Song not found' });
        }

        if (playlist.songs.some(existingSongId => existingSongId.toString() === songId.toString())) {
            return res.status(400).json({ message: "Song is already in the playlist" });
        }

        playlist.songs.push(songId);
        await playlist.save();

        res.status(200).json({ message: 'Song added to playlist', playlist });
    } catch (error) {
        console.error("Error adding to playlist", error);
        res.status(500).json({ message: error.message });
    }
}

export const removeSong = async (req, res) => {
    try {
        const playlistId = req.params.playlistId;
        const { songId } = req.body;

        if (!mongoose.isValidObjectId(songId) || !mongoose.isValidObjectId(playlistId)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        const song = await Song.findById(songId);
        if (!song) {
            return res.status(404).json({ message: 'Song not found' });
        }

        await Playlist.updateOne(
            { _id: playlistId },
            { $pull: { songs: songId } }
        );
        
        const updatedPlaylist = await Playlist.findById(playlistId).populate('user');

        res.status(200).json({ message: 'Song removed from playlist', playlist: updatedPlaylist });
    } catch (error) {
        console.error("Error removing from playlist", error);
        res.status(500).json({ message: error.message });
    }
}

export const editPlaylist = async (req, res) => {
    try {
        const playlistId = req.params.playlistId;
        const userId = req.user.id;

        const playlist = await Playlist.findById(playlistId).populate('user').populate('songs').exec();

        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        if (String(playlist.user._id) !== userId) {
            return res.status(403).json({ message: 'You are not authorized to edit this playlist' });
        
        }

        const { name, description } = req.body;

        let picturePath = null;
        if (req.file) {
            picturePath = req.file.key;
        }

        if (name) {
            playlist.name = name;
        }
        if (description) {
            playlist.description = description;
        }
        if (picturePath) {
            playlist.picturePath = picturePath;
        }

        const updatedPlaylist = await playlist.save();

        res.status(200).json({ message: 'Playlist edited succesfully', playlist: updatedPlaylist });
    } catch (error) {
        console.error("Error editing playlist", error);
        res.status(500).json({ message: error.message });
    }
}

export const deletePlaylist = async (req, res) => {
    try {
        const { playlistId } = req.params;
        const userId = req.user.id;

        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found '});
        }

        if (playlist.user._id.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this playlist' });
        }

        await User.updateOne(
            { _id: userId },
            { $pull: { playlists: playlistId } }
        );

        await Playlist.findByIdAndRemove(playlistId);

        res.status(200).json({ message: 'Playlist deleted succesfully' });
    } catch (error) {
        console.error("Error deleting playlist", error);
        res.status(500).json({ message: error.message });
    }
}

export const togglePrivacy = async (req, res) => {
    try {
        const { playlistId } = req.params;
        const userId = req.user.id;

        const playlist = await Playlist.findById(playlistId).populate('songs').populate('user').exec();

        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found '});
        }

        if (playlist.user._id.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to update this playlist' });
        }

        playlist.privacy = playlist.privacy === "Private" ?  "Public" : "Private";
        
        const updatedPlaylist = await playlist.save();

        res.status(200).json({ message: 'Playlist updated succesfully', playlist: updatedPlaylist });
    } catch (error) {
        console.error("Error modifying playlist", error);
        res.status(500).json({ message: error.message });
    }
}