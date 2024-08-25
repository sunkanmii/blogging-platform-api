import { Router } from "express";
import { createPost, deletePost, getPost, getPosts, likeOrDislikePost, updatePost } from "../controllers/postsController.js";
import { createComment, deleteComment, getComment, getComments } from "../controllers/commentsController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import { commentCreationSchema, postCreationSchema, postUpdateScema } from "../validation/postSchemas.js";
import { getCommentReplies } from "../controllers/repliesController.js";

const router = Router();

// posts

router.get('/', getPosts);

router.get('/:postId', getPost);

router.post('/', authenticateToken, postCreationSchema, createPost);

router.post('/:postId/like', authenticateToken, likeOrDislikePost);

router.patch('/:postId', authenticateToken, postUpdateScema, updatePost);

router.delete('/:postId', authenticateToken, deletePost);

// comments

router.get('/:postId/comments', getComments);

router.get('/:postId/comments/:commentId', getComment);

router.post('/:postId/comments', authenticateToken, commentCreationSchema, createComment);

router.delete('/:postId/comments/:commentId', authenticateToken, deleteComment);

// replies

router.get('/:post/comments/:commentId/replies', getCommentReplies);

export default router;