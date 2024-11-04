import mongoose from "mongoose";
import Comment from "../mongoose/schemas/comment.js";

const checkCommentExists = async (req, res, next) => {
    if(!mongoose.isValidObjectId(req.params.commentId)) return res.status(400).json({ message: "Comment id is not valid!" });
    
    try {
        const comment = await Comment.findById(req.params.commentId);

        if(!comment) return res.status(404).json({ message: "Comment not found" });

        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
}

export default checkCommentExists;