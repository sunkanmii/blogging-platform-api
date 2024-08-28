import { Router } from "express";
import { createPost, deletePost, getPost, getPosts, likeOrDislikePost, updatePost } from "../controllers/postsController.js";
import { createComment, deleteComment, getComment, getComments, likeOrDislikeComment, updateComment } from "../controllers/commentsController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import { commentCreationSchema, commentUpdateSchema, postCreationSchema, postUpdateScema, replyUpdateSchema } from "../validation/postSchemas.js";
import { createCommentReply, deleteCommentReply, getCommentReplies, likeOrDislikeReply, updateCommentReply } from "../controllers/repliesController.js";

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

router.post('/:postId/comments/:commentId/like', authenticateToken, likeOrDislikeComment);

router.patch('/:postId/comments/:commentId', authenticateToken, commentUpdateSchema, updateComment);

router.delete('/:postId/comments/:commentId', authenticateToken, deleteComment);

// replies

router.get('/:postId/comments/:commentId/replies', getCommentReplies);

router.post('/:postId/comments/:commentId/replies', authenticateToken, commentUpdateSchema, createCommentReply);

router.post('/:postId/comments/:commentId/replies/:replyId/like', authenticateToken, likeOrDislikeReply);

router.patch('/:postId/comments/:commentId/replies/:replyId', authenticateToken, replyUpdateSchema, updateCommentReply);

router.delete('/:postId/comments/:commentId/replies/:replyId', authenticateToken, deleteCommentReply);

export default router;