import mongoose, { Schema, SchemaTypes } from "mongoose";

const contentBlockSchema = new Schema({
    type: {
        type: SchemaTypes.String,
        enum: ['text', 'header', 'image', 'code'],
        required: true
    },
    value: {
        type: SchemaTypes.String,
        required: true
    },
    language: {
        type: SchemaTypes.String,
        required: function(){ return this.type === 'code'; }
    }
},
{
    _id: false // Prevents creating a separate _id for each content block
})

const postSchema = new Schema({
    title: {
        type: SchemaTypes.String,
        required: true
    },
    description: {
        type: SchemaTypes.String,
        required: true
    },
    content: [contentBlockSchema], // array of content blocks
    author: {
        type: SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [
        {
            type: SchemaTypes.String
        }
    ],
    likes: {
        type: SchemaTypes.Number,
        default: 0
    },
    dislikes: {
        type: SchemaTypes.Number,
        default: 0
    },
    comments: {
        type: SchemaTypes.Number,
        default: 0
    }
},
{
    timestamps: true
})

postSchema.index({ tags: 1 });

export default mongoose.model('Post', postSchema);