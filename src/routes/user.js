import { Router } from "express";
import { getUser } from "../controllers/userController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import Roles from "../utils/roles.js";

const router = Router();

router.get('/me', authenticateToken, getUser);

router.get('/:userId', authenticateToken, getUser);

// router.get('/', authenticateToken, authorizeRoles(Roles.ADMIN, Roles.MODERATOR), getUsers); //Todo

// router.get('/', authenticateToken, authorizeRoles(Roles.ADMIN, Roles.MODERATOR), getModerators); //Todo 

export default router;