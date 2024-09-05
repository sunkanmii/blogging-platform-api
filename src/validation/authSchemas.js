import { body } from "express-validator";
import User from "../mongoose/schemas/user.js";

export const signupSchema = [
    body('fullName')
        .trim()
        .notEmpty()
        .isString()
        .withMessage('Invalid full name'),
    body('username')
        .trim()
        .notEmpty()
        .isString()
        .withMessage('Invalid username')
        .custom(async (value) => {
            const user = await User.findOne({ username: value });
            return !Boolean(user);
        })
        .withMessage('Username is already taken'),
    body('email')
        .normalizeEmail()
        .isEmail()
        .withMessage('Email address is not valid')
        .custom(async (value) => {
            const user = await User.findOne({ email: value });
            return !Boolean(user);
        })
        .withMessage('Email address is already taken'),
    body('password')
        .trim()
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })
        .withMessage('Password must be at least 8 characters long and include one lowercase letter, one uppercase letter, one number, and one symbol.')
    ];

export const loginSchema = [
    body('eamil')
        .normalizeEmail()
        .isEmail()
        .withMessage('Email address is not valid'),
    body('password')
    .trim()
    .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })
    .withMessage('Password must be at least 8 characters long and include one lowercase letter, one uppercase letter, one number, and one symbol.')
];

export const emailSchema = [
    body('email')
        .normalizeEmail()
        .isEmail()
        .withMessage('Email address is not valid')
];

export const passwordSchema = [
    body('token')
        .trim()
        .isString()
        .withMessage('Invalid token'),
    body('password')
        .trim()
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })
        .withMessage('Password must be at least 8 characters long and include one lowercase letter, one uppercase letter, one number, and one symbol.')
];