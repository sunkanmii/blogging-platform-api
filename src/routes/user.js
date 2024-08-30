import { Router } from "express";
import { changeUserRole, deleteUser, getUser, getUsers, updateUser } from "../controllers/userController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import { Roles } from "../utils/enums.js";
import { changeUserRoleSchema, userUpdateSchema } from "../validation/userSchema.js";

const router = Router();

router.get('/me', authenticateToken, getUser);

router.get('/:userId', authenticateToken, getUser);

router.get('/', authenticateToken, authorizeRoles(Roles.ADMIN, Roles.MODERATOR), getUsers);

router.patch('/:userId', authenticateToken, userUpdateSchema, updateUser);

router.post('/:userId/role', authenticateToken, authorizeRoles(Roles.ADMIN), changeUserRoleSchema, changeUserRole);

router.delete('/:userId', authenticateToken, deleteUser);

export default router;