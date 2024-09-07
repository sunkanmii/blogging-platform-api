import { Router } from 'express';
import { emailSchema, loginSchema, passwordSchema, signupSchema } from '../validation/authSchemas.js';
import { activateAccount, generateTokenForPasswordReset, login, logout, refreshToken, resendActivationEmail, signup, updatePassword, validatePasswordResetToken } from '../controllers/authController.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = Router();

router.post('/register', signupSchema, signup);

router.post('/login', loginSchema, login);

router.get('/account-activation/:token', activateAccount);

router.post('/account-activation', emailSchema, resendActivationEmail);

router.post('/logout', authenticateToken, logout);

router.post('/refresh-token', refreshToken);

router.post('/password-reset', emailSchema, generateTokenForPasswordReset);

router.get('/password-reset/:token', validatePasswordResetToken);

router.put('/password-update', passwordSchema, updatePassword);

export default router;