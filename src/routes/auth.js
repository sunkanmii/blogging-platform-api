import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { loginSchema, signupSchema } from '../validation/authSchemas.js';
import { login, logout, refreshToken, signup } from '../controllers/authController.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = Router();

router.post('/register', checkSchema(signupSchema), signup);

router.post('/login', checkSchema(loginSchema), login);

router.post('/logout', authenticateToken, logout);

router.post('/refresh-token', refreshToken);

export default router;