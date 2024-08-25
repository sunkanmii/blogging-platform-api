import mongoose from "mongoose";
import Post from "../mongoose/schemas/post.js";
import User from "../mongoose/schemas/user.js";
import Comment from "../mongoose/schemas/comment.js"
import Like from "../mongoose/schemas/like.js";
import { matchedData, validationResult } from "express-validator";

export const getComments = async (req, res) => {
    // validate the post id
    if(!mongoose.isValidObjectId(req.params.postId)){
        return res.status(400).json({ message: "Post id is not valid!" });
    }

    const { limit = 10, cursor, sort = "top" } = req.query;
    // is the limit query param valid
    if(isNaN(limit)){
        return res.status(400).json({ message: "limit should be a number" });
    }

    // the sort query
    const sortQuery = {};
    switch (sort){
        case "newest": sortQuery._id = -1; break;
        case "oldest": sortQuery._id = 1; break;
        case "top": sortQuery.likes = -1; sortQuery._id = -1; break
        default: return res.status(400).json({ message: "Invalid sort query param value" });
    }

    // the find() query
    const query = { post: req.params.postId, replyTo: null };
    if(cursor){
        // is cursor valid
        if(!mongoose.isValidObjectId(cursor)){
            return res.status(400).json({ message: "cursor is not valid" });
        }

        const lastComment = await Comment.findById(cursor);
        if(!lastComment){
            return res.status(400).json({ msg: "Cursor does not exist"});
        }
        
        if(sort === "top"){
            query.$or = [
                { likes: { $lt: lastComment.likes } },
                { likes: lastComment.likes, _id: { $lt: cursor }}
            ];
        } else if(sort === "newest"){
            query._id = { $lt: cursor };
        } else {
            query._id = { $gt: cursor };
        }
    }

    try {
        const comments = await Comment.find(query, { __v: false })
            .sort(sortQuery)
            .limit(limit)
            .populate('owner', 'username profileImage')
            .exec();

        const length = comments.length;

        const nextCursor = (length && length >= parseInt(limit)) ? comments[length - 1]._id : null;

        return res.status(200).json({ cursor: nextCursor, comments });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}

export const getComment = async (req, res) => {
    if(!mongoose.isValidObjectId(req.params.postId)) return res.status(400).json({ message: "Post id is not valid!" });
    if(!mongoose.isValidObjectId(req.params.commentId)) return res.status(400).json({ message: "Comment id is not valid!" });

    try {
        const comment = await Comment.findOne({ _id: req.params.commentId, post: req.params.postId, replyTo: null }, { __v: false, replyTo: false })
            .populate('owner', 'username profileImage')
            .lean();

        if(!comment) return res.status(404).json({ msg: "Comment not found" });

        return res.status(200).json(comment);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
}

export const createComment = async (req, res) => {
    const result = validationResult(req);
    if(!result.isEmpty()) return res.status(400).json({ errors: result.array() });
    const { id, body } = matchedData(req);    
    try {
        const comment = new Comment({
            post: id,
            owner: req.user.postId,
            body,
        });
        await comment.save();

        return res.status(201).json({ msg: 'comment was created successfuly' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });        
    }
}

export const deleteComment = async (req, res) => {
    if(!mongoose.isValidObjectId(req.params.postId)) return res.status(400).json({ msg: "Invalid post id" });
    if(!mongoose.isValidObjectId(req.params.commentId)) return res.status(400).json({ msg: "Invalid comment id" });
    
    let session = null;

    try {
        const comment = await Comment.findById(req.params.commentId);
        if(!comment) return res.status(404).json({ msg: "Comment not found" });
        if(!req.user.isAdmin && (comment.owner.toString() !== req.user.id)) return res.status(403).json({ message: 'Forbidden: You do not have the necessary permissions to create a post.' });

        session = await mongoose.startSession();
        session.startTransaction();

        await comment.deleteOne();
        await Comment.deleteMany({ replyTo: req.params.commentId });
        await Like.deleteMany({ comment: req.params.commentId }); 

        await session.commitTransaction();
        session.endSession();

        return res.sendStatus(204);
    } catch (error) {
        if(session !== null){
            await session.abortTransaction();
            session.endSession();
        }

        console.log(error);
        return res.status(500).json(error);
    }
}