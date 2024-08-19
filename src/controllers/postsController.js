import mongoose from "mongoose";
import Post from "../mongoose/schemas/post.js";
import User from "../mongoose/schemas/user.js";

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
        const post = await Post.findById(req.params.id, { __v: false }).populate('author', 'fullName profileImage').lean();       
        if(!post) return res.status(404).json({message: "Post not found!"});
        return res.json(post);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}