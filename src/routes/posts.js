import { Router } from "express";
import Post from "../mongoose/schemas/post.js";
import { getPost, getPosts } from "../controllers/postsController.js";

const router = Router();

router.get('/', getPosts);

router.get('/:id', getPost);

router.post('/', async (req, res) => {
    const {title, content, tags} = req.body;
    try {
        const post = new Post({
            author: '66c28280c8e2db322f6afe01',
            title,
            content,
            tags
        })
        await post.save();
        return res.sendStatus(201);
    } catch (error) {
        console.log(error);
        return res.json({ message: error.message });  
    }
})

export default router;