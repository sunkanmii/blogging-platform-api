import { body, param, query } from 'express-validator';
import { Sort } from '../utils/enums.js';
import mongoose from 'mongoose';

const validateContentBlock = (block) => {
    // Perform validation for a single content block
    const errors = [];
    if (!['text', 'header', 'image', 'code'].includes(block.type)) {
        return false;
    }
    if (!block.value || typeof block.value !== 'string') {
        return false;
    }
    if (block.type === 'code' && !block.language) {
        return false;
    }
    return true;
};

export const postCreationSchema = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Post title is required')
        .isString()
        .withMessage('Post title must be a string'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Post description is required')
        .isString()
        .withMessage('Post description must be a string'),
    body('content')
        .isArray()
        .withMessage('Content must be an array')
        .custom((content) => {
            if(content.length === 0) return false;
            return true;
        })
        .withMessage('Content must not be empty')
        .custom((content) => {
            for (const block of content) {
                if(!validateContentBlock(block)){
                    return false;
                }
            }
            return true;
        })
        .withMessage('Invalid content block format'),
    body('tags')
        .isArray()
        .withMessage('Tags must be an array')
        .custom((tags) => {
            if(tags.length === 0) return false;
            return true;
        })
        .withMessage('Tags must not be an empty array')
        .custom((tags) => {
            return tags.every(tag => typeof tag === 'string');
        })
        .withMessage('Each tag must be a string')
];

export const postUpdateScema = [
    body('title')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Post title is required')
        .isString()
        .withMessage('Post title must be a string'),
    body('description')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Post description is required')
        .isString()
        .withMessage('Post description must be a string'),
    body('content')
        .optional()
        .isArray()
        .withMessage('Content must be an array')
        .custom((content) => {
            if(content.length === 0) return false;
            return true;
        })
        .withMessage('Content must not be empty')
        .custom((content) => {
            for (const block of content) {
                if(!validateContentBlock(block)){
                    return false;
                }
            }
            return true;
        })
        .withMessage('Invalid content block format'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array')
        .custom((tags) => {
            if(tags.length === 0) return false;
            return true;
        })
        .withMessage('Tags must not be an empty array')
        .custom((tags) => {
            return tags.every(tag => typeof tag === 'string');
        })
        .withMessage('Each tag must be a string')
];

export const getPostSchema = [
    query('limit')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Limit should be a positive integer'),

    query('cursor')
        .optional()
        .custom((value) => {
            if (!mongoose.isValidObjectId(value)) {
                throw new Error('Cursor is not valid');
            }
            return true;
        }),

    query('sort')
        .optional()
        .isIn([Sort.NEWEST, Sort.OLDEST, Sort.TOP])
        .withMessage('Invalid sort query param value'),

    query('search')
        .optional()
        .isString()
        .trim()
        .withMessage('Search query param must be a string'),

    query('tags')
        .optional()
        .isString()
        .matches(/^[a-zA-Z0-9,]*$/)
        .withMessage('Tags query param should be a comma-separated list of words')
];
