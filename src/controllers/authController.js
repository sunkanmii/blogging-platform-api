import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../mongoose/schemas/user.js';
import { matchedData, validationResult } from "express-validator";
import { generateAccessToken, generateRefreshToken } from '../utils/auth.js';

export const signup = async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errors = result.array();
        const errorMessages = {};
        errorMessages.fullName = errors.find(error => error.path === "fullName")?.msg;
        errorMessages.username = errors.find(error => error.path === "username")?.msg;
        errorMessages.email = errors.find(error => error.path === "email")?.msg;
        errorMessages.password = errors.find(error => error.path === "password")?.msg;
        return res.status(400).json({ errorMessages });
    }
    try {
        const { fullName, username, email, password } = matchedData(req);
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ fullName, username, email, password: hashedPassword });
        await newUser.save();

        const theUser = { 
            fullName: newUser.fullName, 
            username: newUser.username, 
            email: newUser.email, 
            profileImage: null, 
            isAdmin: false
        }

        const accessToken = generateAccessToken(theUser);
        const refreshToken = generateRefreshToken(theUser);

        newUser.refreshTokens.push(refreshToken);
        await newUser.save();

        return res.status(201).json({ accessToken, refreshToken });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `Error occured while signup process ${error.message}` });
    }
}

export const login = async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errorMessage: 'Invalid credentials' });
    }
    const { email, password } = matchedData(req);
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ errorMessage: 'Invalid credentials' });
        }
        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            return res.status(400).json({ errorMessage: 'Invalid credentials' });
        }

        const theUser = { 
            fullName: user.fullName, 
            username: user.username, 
            email: user.email, 
            profileImage: user.profileImage, 
            isAdmin: user.isAdmin 
        }

        const accessToken = generateAccessToken(theUser);
        const refreshToken = generateRefreshToken(theUser);

        user.refreshTokens.push(refreshToken);
        await user.save();

        return res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `Error occured while login process: ${error.message}` });
    }
}

export const logout = async (req, res) => {
    const { refreshToken } = req.body;

    if(!refreshToken) return res.status(400).json({ message: 'Refresh token is required' });

    try {
        const foundUser = await User.findOne({ refreshTokens: {$in: [refreshToken]} });

        if(!foundUser) return res.status(401).json({ message: 'refresh token is not found' });

        foundUser.refreshTokens.pull(refreshToken);
        await foundUser.save();

        return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `Error occured while logout process: ${error.message}` }); 
    }
}

export const refreshToken = async (req,res) => {
    const { refreshToken } = req.body;

    if(!refreshToken) return res.status(400).json({ message: 'Refresh token is required' });

    try {
        const foundUser = await User.findOne({ refreshTokens: {$in: [refreshToken]} });

        if(!foundUser) return res.status(401).json({ message: 'refresh token is not found' });

        jwt.verify(refreshToken, process.env.JWT_SECRET_KEY, async (error) => {
            if(error){
                if(error.name === "TokenExpiredError"){
                    foundUser.refreshTokens.pull(refreshToken);
                    await foundUser.save();
                }
                return res.status(401).json({ message: 'Invalid or expired refresh token'});
            }

            const theUser = { 
                fullName: foundUser.fullName, 
                username: foundUser.username, 
                email: foundUser.email, 
                profileImage: foundUser.profileImage, 
                isAdmin: foundUser.isAdmin 
            }
            const accessToken = generateAccessToken(theUser);
            return res.status(200).json({ accessToken });
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `Error occured while refresh token process: ${error.message}` }); 
    }
}