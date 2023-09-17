import mongoose from "mongoose";

const Schema = mongoose.Schema;

const playlistSchema = new Schema(
    {
        name: {
                type: String,
                required: true,
            },
        songs: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Song',
            },
        ],
        privacy: {
            type: String,
            enum: ['Private', 'Public'],
            default: 'Private',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        picturePath: {
            type: String,
            default: "",
        },
        description: {
            type: String,
            default: "",
        },
    } ,{ timestamps: true }
);

const Playlist = mongoose.model("Playlist", playlistSchema);

export default Playlist;