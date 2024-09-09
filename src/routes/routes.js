import { Router } from "express";
import postsRouter from "./posts.js";
import authRouter from "./auth.js";
import userRouter from "./user.js";

const router = Router();

router.use('/auth', authRouter);
router.use('/posts', postsRouter);
router.use('/users', userRouter);

export default router;