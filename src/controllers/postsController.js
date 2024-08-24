import mongoose from "mongoose";
import Post from "../mongoose/schemas/post.js";
import User from "../mongoose/schemas/user.js";
import Comment from "../mongoose/schemas/comment.js"
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
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).json({message: "Post id is not valid!"});
    }
    try {
        const foundPost = await Post.findById(req.params.id, { __v: false })
            .populate('author', 'fullName profileImage')
            .lean();       

        if(!foundPost) return res.status(404).json({message: "Post not found!"});

        return res.status(200).json(foundPost);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}

export const getComments = async (req, res) => {
    // validate the post id
    if(!mongoose.isValidObjectId(req.params.id)){
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
    const query = { post: req.params.id, replyTo: null };
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

export const createComment = async (req, res) => {
    const result = validationResult(req);
    if(!result.isEmpty()) return res.status(400).json({ errors: result.array() });
    const { id, body } = matchedData(req);    
    try {
        const comment = new Comment({
            post: id,
            owner: req.user.id,
            body,
        });
        await comment.save();

        return res.status(201).json({ msg: 'comment was created successfuly' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });        
    }
}