import { Router } from "express";
import { createComment, createPost, getComments, getPost, getPosts } from "../controllers/postsController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import { commentCreationSchema, postCreationSchema } from "../validation/postSchemas.js";

const router = Router();

router.get('/', getPosts);

router.get('/:id', getPost);

router.get('/:id/comments', getComments);

router.post('/', authenticateToken, postCreationSchema, createPost);

router.post('/:id/comments', authenticateToken, commentCreationSchema, createComment);

export default router;