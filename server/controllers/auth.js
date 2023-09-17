import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Playlist from "../models/playlist.js";

export const signUp = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            username,
            email,
            password,
            followers,
            following,
            playlists,
            likedSongs
        } = req.body;

        let picturePath;
        if (req.file) {
            picturePath = req.file.key;
        } else {
            picturePath = "default-profile.png";
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        
        const newUser = new User({
            firstName,
            lastName,
            username,
            email,
            password: passwordHash,
            picturePath,
            followers,
            following,
            playlists,
            likedSongs
        });

        await newUser.save();

        const likedSongsPlaylist = new Playlist({
            name: "Liked Songs",
            songs: [],
            privacy: "Private",
            user: newUser._id,
        })

        await likedSongsPlaylist.save();

        newUser.likedSongs = likedSongsPlaylist._id;

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
        delete user.password;
        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};