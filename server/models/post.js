import mongoose from "mongoose";

const Schema = mongoose.Schema;

const postSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        song: {
            type: Schema.Types.ObjectId,
            ref: 'Song',
            required: true,
        },
        caption: {
            type: String,
        },
        likes: {
            type: Map,
            of: Boolean,
        },
        comments: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Comment',
            },
        ], // TODO make comments have likes and replies (create its own schema)
    }, {timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;