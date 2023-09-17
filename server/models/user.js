import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            min: 2,
            max: 50,
        },
        lastName: {
            type: String,
            required: true,
            min: 2,
            max: 50,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            min: 3,
            max: 20,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            max: 50,
        },
        password: {
            type: String,
            required: true,
            min: 5,
        },
        picturePath: {
            type: String,
            default: "",
        },
        followers: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        following: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        playlists: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Playlist',
            },
        ],
        likedSongs: {
                type: Schema.Types.ObjectId,
                ref: 'Playlist',
        },
        songs: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Song',
            },
        ],
        posts: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Post',
            },
        ],
        privacy: {
            type: String,
            enum: ['Private', 'Public'],
            default: 'Private',
        },
    }, { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;