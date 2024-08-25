import mongoose from "mongoose";
import Comment from "../mongoose/schemas/comment.js";

export const getCommentReplies = async (req, res) => {
    if(!mongoose.isValidObjectId(req.params.postId)) return res.status(400).json({ message: "Post id is not valid!" });
    if(!mongoose.isValidObjectId(req.params.commentId)) return res.status(400).json({ message: "Comment id is not valid!" });

    try {
        const replies = await Comment.find({ post: req.params.postId, replyTo: req.params.commentId }, { __v: false, replyTo: false })
            .populate("owner", "username profileImage")
            .lean();
        
        return res.status(200).json(replies);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
}