import mongoose from "mongoose";

const Schema = mongoose.Schema;

const songSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        artist: {
            type: String,
            required: true,
        },
        filePath: {
            type: String,
        },
        duration: {
            type: Number,
            required: true,
        },
        picturePath: {
            type: String,
            default: "",
        },
        user : {
            type: Schema.Types.ObjectId,
            ref: 'User',
        }
    }, { timestamps: true }
);

const Song = mongoose.model("Song", songSchema);

export default Song;