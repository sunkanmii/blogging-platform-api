import { Router } from "express";
import { getUser, getUsers } from "../controllers/userController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import { Roles } from "../utils/enums.js";

const router = Router();

router.get('/me', authenticateToken, getUser);

router.get('/:userId', authenticateToken, getUser);

router.get('/', authenticateToken, authorizeRoles(Roles.ADMIN, Roles.MODERATOR), getUsers);

export default router;