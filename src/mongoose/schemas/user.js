import mongoose, { Schema, SchemaTypes } from "mongoose";

const userSchema = new Schema({
    fullName: {
        type: SchemaTypes.String,
        required: true
    },
    username: {
        type: SchemaTypes.String,
        required: true
    },
    email: {
        type: SchemaTypes.String,
        required: true,
        unique: true
    },
    profileImage: {
        type: SchemaTypes.String,
        default: null
    },
    password: {
        type: SchemaTypes.String
    },
    resetPasswordToken: {
        type: SchemaTypes.String,
        default: null
    },
    resetPasswordExpires: {
        type: SchemaTypes.String,
        default: null
    },
});

export default mongoose.model('User', userSchema);