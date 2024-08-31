import { body, param } from "express-validator";
import User from "../mongoose/schemas/user.js";
import { Roles } from "../utils/enums.js";

export const userUpdateSchema = [
    body('fullName')
        .trim()
        .notEmpty()
        .isString()
        .withMessage('Invalid full name')
        .optional(),
    body('username')
        .trim()
        .notEmpty()
        .isString()
        .withMessage('Invalid username')
        .custom(async (value) => {
            const user = await User.findOne({ username: value });
            return !Boolean(user);
        })
        .withMessage('Username is already taken')
        .optional(),
    body('email')
        .normalizeEmail()
        .isEmail()
        .withMessage('Email address is not valid')
        .custom(async (value) => {
            const user = await User.findOne({ email: value });
            return !Boolean(user);
        })
        .withMessage('Email address is already taken')
        .optional(),
    body('profileImage')
        .trim()
        .isURL()
        .withMessage('Invalid profile image url')
        .optional(),
    body('password')
        .trim()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .optional(),
    ];

export const changeUserRoleSchema = [
    param('userId')
        .trim()
        .isMongoId()
        .withMessage('Invalid user id'),
    body('role')
        .trim()
        .custom((value) => [Roles.ADMIN, Roles.MODERATOR, Roles.USER].includes(value))
        .withMessage("Invalid role, it should be 'user', 'moderator', or 'admin'")
];