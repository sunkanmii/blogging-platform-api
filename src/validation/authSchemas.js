import User from "../mongoose/schemas/user.js";

export const signupSchema = {
    fullName: {
        trim: true,
        notEmpty: true,
        isString: true,
        errorMessage: "full name is not valid"
    },
    username: {
        trim: true,
        notEmpty: true,
        isString: true,
        errorMessage: "username is not valid",
        custom: {
            options: async (value) => {
                const user = await User.findOne({ username: value });
                if (user) {
                    throw new Error("Username is already used");
                }
                return true;
            },
            errorMessage: "Error during username validation", // Optional: default error message if not caught
        }
    },
    email: {
        normalizeEmail: true,
        isEmail: true,
        errorMessage: "Email address is not valid",
        custom: {
            options: async (value) => {
                const user = await User.findOne({ email: value });
                if (user) {
                    throw new Error("email address is already used");
                }
                return true;
            },
            errorMessage: "Error during address validation", // Optional: default error message if not caught
        }
    },
    password: {
        trim: true,
        isLength: {
            options: { min: 6 },
            errorMessage: 'Password must be at least 6 characters long',
        },
    }
}

export const loginSchema = {
    email: {
        normalizeEmail: true,
        isEmail: true,
    },
    password: {
        trim: true,
        notEmpty: true,
        isString: true,
    }
}