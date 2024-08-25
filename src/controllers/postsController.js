import mongoose from "mongoose";
import Post from "../mongoose/schemas/post.js";
import User from "../mongoose/schemas/user.js";
import Comment from "../mongoose/schemas/comment.js"
import Like from "../mongoose/schemas/like.js";
import { matchedData, validationResult } from "express-validator";

export const getPosts = async (req, res) => {
    const { limit = 3, cursor } = req.query;

    if(isNaN(limit)){
        return res.status(400).json({message: "limit should be a number"});
    }

    const query = {};
    if(cursor){
        if(!mongoose.isValidObjectId(cursor)){
            return res.status(400).json({message: "cursor is not valid"});
        }
        query._id = { $lt: cursor };
    }
    try {
        const posts = await Post.find(query, { title: true, description: true, author: true, tags: true })
            .sort({ _id: -1 }) // Sort in descending order by _id (latest first)
            .limit(limit)
            .populate('author', 'fullName')
            .exec();

        const nextCursor = (posts.length && posts.length === parseInt(limit)) ? posts[posts.length - 1]._id : null;

        return res.json({
            cursor: nextCursor,
            posts
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}

export const getPost = async (req, res) => {
    if(!mongoose.isValidObjectId(req.params.postId)){
        return res.status(400).json({message: "Post id is not valid!"});
    }
    try {
        const foundPost = await Post.findById(req.params.postId, { __v: false })
            .populate('author', 'fullName profileImage')
            .lean();       

        if(!foundPost) return res.status(404).json({message: "Post not found!"});

        return res.status(200).json(foundPost);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}

export const createPost = async (req, res) => {
    if(!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden: You do not have the necessary permissions to create a post.' });

    const result = validationResult(req);
    if(!result.isEmpty()) {
        const errors = result.array();
        const errorMessages = {};
        errorMessages.title = errors.find((error) => error.path === "title")?.msg;
        errorMessages.description = errors.find((error) => error.path === "description")?.msg;
        errorMessages.content = errors.find((error) => error.path === "content")?.msg;
        errorMessages.tags = errors.find((error) => error.path === "tags")?.msg;
        return res.status(400).json({ errorMessages });
    }

    const {title, description, content, tags} = matchedData(req);
    try {        
        const post = new Post({
            author: req.user.id,
            title,
            description,
            content,
            tags
        });
        await post.save();
        return res.status(201).json({ message: 'Post created successfully.' });
    } catch (error) {
        console.log(error);
        return res.json({ message: error.message });  
    }
}

export const updatePost = async (req, res) => {
    if(!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden: You do not have the necessary permissions to create a post.' });

    if(!mongoose.isValidObjectId(req.params.postId)) return res.status(400).json({ msg: "Invalid post id" });

    const result = validationResult(req);
    if(!result.isEmpty()) {
        const errors = result.array();
        const errorMessages = {};
        errorMessages.title = errors.find((error) => error.path === "title")?.msg;
        errorMessages.description = errors.find((error) => error.path === "description")?.msg;
        errorMessages.content = errors.find((error) => error.path === "content")?.msg;
        errorMessages.tags = errors.find((error) => error.path === "tags")?.msg;
        return res.status(400).json({ errorMessages });
    }

    const data =  matchedData(req);
    if(Object.keys(data).length === 0) return res.status(400).json({ msg: "No valid fields provided for update" })

    const {title, description, content, tags} = data;

    try {
        const post = await Post.findById(req.params.postId);
        if(!post) return res.status(404).json({ msg: "Post not found" });

        if(title) post.title = title;
        if(description) post.description = description;
        if(content) post.content = content;
        if(tags) post.tags = tags;
        await post.save();
        return res.sendStatus(204);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
}

export const deletePost = async (req, res) => {
    if(!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden: You do not have the necessary permissions to create a post.' });

    if(!mongoose.isValidObjectId(req.params.postId)) return res.status(400).json({ msg: "Invalid post id" });

    let session = null;

    try {
        const post = await Post.findById(req.params.postId);
        if(!post) return res.status(404).json({ msg: "Post not found" });

        session = await mongoose.startSession();
        session.startTransaction();

        await post.deleteOne();
        await Comment.deleteMany({ post: req.params.postId });
        await Like.deleteMany({ post: req.params.postId }); 

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

export const likeOrDislikePost = async (req, res) => {
    const postId = req.params.postId;
    if(!mongoose.isValidObjectId(postId)) return res.status(400).json({ msg: "Invalid post id" });

    const { action } = req.body;

    if(!["like", "dislike"].includes(action)) return res.status(400).json({ msg: "Invalid action. Must be 'like' or 'dislike'." });

    let session = null;

    try {
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({ msg: "Post not found" });

        const isLiked = action === "like";

        /*
            likeDoc: check if there is already a Like doc for this post by the authenticated user and with comment field null,
            so to update it, else create a new one
        */
        let likeDoc = await Like.findOne({ post: postId, user: req.user.id, comment: null });
        // if the user is doing the same action (liking a post he already liked or the opposite)
        if(likeDoc && likeDoc.isLiked === isLiked) return res.status(409).json({ msg: `You already ${action}d this post` });

        session = await mongoose.startSession();
        session.startTransaction();

        if(!likeDoc){
            likeDoc = new Like({
                user: req.user.id,
                post: postId,
                isLiked
            });
        } else {
            likeDoc.isLiked = isLiked;
            isLiked ? post.dislikes-- : post.likes--;
        }

        isLiked ? post.likes++ : post.dislikes++;
        
        await likeDoc.save();
        await post.save();

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