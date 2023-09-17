import Post from "../models/post.js";
import Comment from "../models/comment.js";

export const likeComment = async (req, res) => {
    try {
        const { id } = req.params; 
        const userId = req.user.id;

        const comment = await Comment.findById(id).populate('user');
        if (!comment) {
            return res.status(404).json({ message: 'Comment does not exist' });
        }

        const isLiked = comment.likes.get(userId.toString());

        if (isLiked) {
            comment.likes.delete(userId.toString());
        } else {
            comment.likes.set(userId.toString(), true);
        }

        const updatedComment = await comment.save();

        const action = isLiked ? "Unliked" : "Liked";

        res.status(200).json({ message: `${action} comment successfully`, comment: updatedComment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (req.user.id !== comment.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to delete this comment' });
        }

        await Post.updateOne(
            { comments: commentId }, 
            { $pull: { comments: commentId } }
        );

        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

