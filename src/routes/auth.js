import { Router } from 'express';
import { emailSchema, loginSchema, passwordSchema, signupSchema } from '../validation/authSchemas.js';
import { generateTokenForPasswordReset, login, logout, refreshToken, signup, updatePassword, validatePasswordResetToken } from '../controllers/authController.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = Router();

router.post('/register', signupSchema, signup);

router.post('/login', loginSchema, login);

router.post('/logout', authenticateToken, logout);

router.post('/refresh-token', refreshToken);

router.post('/password-reset', emailSchema, generateTokenForPasswordReset);

router.post('/password-reset/:token', validatePasswordResetToken);

router.put('/password-update', passwordSchema, updatePassword);

export default router;