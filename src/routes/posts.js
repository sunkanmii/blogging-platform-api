import { Router } from "express";
import { createPost, getPost, getPosts } from "../controllers/postsController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import { postCreationSchema } from "../validation/postSchemas.js";

const router = Router();

router.get('/', getPosts);

router.get('/:id', getPost);

router.post('/', authenticateToken, postCreationSchema, createPost);

export default router;