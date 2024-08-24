import { body, param } from 'express-validator';

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

export const commentCreationSchema = [
    param('id')
        .isMongoId()
        .withMessage('Invalid post id'),
    body('body')
        .trim()
        .notEmpty()
        .withMessage('Comment must not be empty')
        .isString()
        .withMessage('Comment must be a string')   
];