import mongoose, { Schema, SchemaTypes } from "mongoose";

const commentSchema = new Schema({
    post: {
        type: SchemaTypes.String,
        ref: 'Post',
        required: true
    },
    owner: {
        type: SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    body: {
        type: SchemaTypes.String,
        required: true
    },
    replies: [
        {
            type: SchemaTypes.ObjectId,
            ref: 'Comment'
        }
    ],
    likes: [{
        type: SchemaTypes.ObjectId,
        ref: 'User'
    }],
    dislikes: [{
        type: SchemaTypes.ObjectId,
        ref: 'User'
    }]
},
{
    timestamps: true
})

export default mongoose.model('Comment', commentSchema);