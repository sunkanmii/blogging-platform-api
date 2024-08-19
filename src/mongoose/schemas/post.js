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

export default mongoose.model('Post', postSchema);