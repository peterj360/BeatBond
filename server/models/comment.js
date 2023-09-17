import mongoose from "mongoose";

const Schema = mongoose.Schema;

const commentSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        likes: {
            type: Map,
            of: Boolean,
        },
        replies: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                text: {
                    type: String,
                    required: true,
                },
                likes: {
                    type: Map,
                    of: Boolean,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            }
        ]
    }, {timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;