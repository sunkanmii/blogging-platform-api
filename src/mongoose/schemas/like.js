import mongoose, { Schema, SchemaTypes } from "mongoose";

const likeSchema = new Schema({
    user: {
        type: SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: SchemaTypes.ObjectId,
        ref: 'Post',
        required: false // If it's a like on a comment, this can be null
    },
    comment: {
        type: SchemaTypes.ObjectId,
        ref: 'Comment',
        required: false // If it's a like on a post, this can be null
    },
    isLiked: {
        type: SchemaTypes.Boolean,
        required: true // true for like, false for dislike
    }
}, {
    timestamps: true
});

likeSchema.index({ user: 1 });
likeSchema.index({ post: 1 });
likeSchema.index({ comment: 1 });

export default mongoose.model('Like', likeSchema);