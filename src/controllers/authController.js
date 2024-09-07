import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import User from '../mongoose/schemas/user.js';
import { matchedData, validationResult } from "express-validator";
import { generateAccessToken, generateRefreshToken } from '../utils/auth.js';
import { sendActivationEmail, sendResetPasswordEmail } from '../utils/email.js';

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
    const { fullName, username, email, password } = matchedData(req);
    try {

        const hashedPassword = await bcrypt.hash(password, 12);
        const token = crypto.randomBytes(32).toString('hex');

        const newUser = new User({ 
            fullName, 
            username, 
            email, 
            password: hashedPassword,
            activationToken: token,
            activationTokenExpires: Date.now() + (3600000 * 24) // 24 hours
        });

        await newUser.save();

        await sendActivationEmail(email, token);

        return res.status(201).json({ msg: "Signup successful! Please check your email to activate your account." });
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

        if(!user.isActive){
            return res.status(403).json({ msg: "Your account is not activated. Please check your email for the activation link." });
        }

        const theUser = { 
            id: user._id,
            fullName: user.fullName, 
            username: user.username, 
            email: user.email, 
            profileImage: user.profileImage, 
            role: user.role
        }

        const accessToken = generateAccessToken(theUser);
        const refreshToken = generateRefreshToken(theUser);

        user.refreshTokens.push(refreshToken);
        await user.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'None',
            secure: process.env.NODE_ENV === 'production',  // Only use secure cookies in production
            maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
        });

        return res.status(200).json({ accessToken });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `Error occured while login process: ${error.message}` });
    }
}

export const activateAccount = async (req, res) => {
    const token = req.params.token;

    try {
        const user = await User.findOne({ activationToken: token });
        if(!user){
            return res.status(404).json({ msg: "Token is not found or invalid" });
        }

        if(user.activationTokenExpires < Date.now()){
            user.activationToken = null;
            user.activationTokenExpires = null;
            await user.save();
            return res.status(400).json({ msg: "Token has expired" });
        }

        user.activationToken = null;
        user.activationTokenExpires = null;
        user.isActive = true;
        
        await user.save();

        return res.status(200).json({ msg: "Your account has been successfully activated. Please log in to continue." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `Error occured: ${error.message}` }); 
    }
}

export const resendActivationEmail = async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errorMessages: result.array() });
    }
    const { email } = matchedData(req);
    try {
        const user = await User.findOne({ email });

        if(!user){
            return res.status(400).json({ msg: "User not found" });
        }

        const token = crypto.randomBytes(32).toString('hex');

        user.activationToken = token,
        user.activationTokenExpires = Date.now() + (3600000 * 24) // 24 hours

        await user.save();

        await sendActivationEmail(email, token);

        return res.status(200).json({ msg: "Email was sent! Please check your email to activate your account." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `Error occured while signup process ${error.message}` });
    }
}

export const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(200).json({ message: 'Already logged out' });
    }

    try {
        const foundUser = await User.findOne({ refreshTokens: {$in: [refreshToken]} });

        if(!foundUser) {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'None'
            });
            return res.status(401).json({ message: 'refresh token is not found' });
        }

        foundUser.refreshTokens.pull(refreshToken);
        await foundUser.save();

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None'
        });

        return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `Error occured while logout process: ${error.message}` }); 
    }
}

export const refreshToken = async (req,res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided, please log in again' });
    }

    try {
        const foundUser = await User.findOne({ refreshTokens: {$in: [refreshToken]} });

        if(!foundUser) {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'None'
            });
            return res.status(401).json({ message: 'refresh token is not found' });
        }

        jwt.verify(refreshToken, process.env.JWT_SECRET_KEY, async (error) => {
            if(error){
                if(error.name === "TokenExpiredError"){
                    foundUser.refreshTokens.pull(refreshToken);
                    await foundUser.save();
                }
                res.clearCookie('refreshToken', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'None'
                });
                return res.status(401).json({ message: 'Invalid or expired refresh token'});
            }

            const theUser = { 
                id: foundUser._id,
                fullName: foundUser.fullName, 
                username: foundUser.username, 
                email: foundUser.email, 
                profileImage: foundUser.profileImage, 
                role: foundUser.role
            }
            const accessToken = generateAccessToken(theUser);
            return res.status(200).json({ accessToken });
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `Error occured while refresh token process: ${error.message}` }); 
    }
}

export const generateTokenForPasswordReset = async (req, res) => {
    const result = validationResult(req);
    if(!result.isEmpty()) return res.status(400).json({ errorMessages: result.array() });
    const { email } = matchedData(req);
    
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ message: 'If the email exists in our system, you will receive a password reset link shortly.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000 // 1 hour
        await user.save();
        
        await sendResetPasswordEmail(email, token);

        res.status(200).json({ message: 'If the email exists in our system, you will receive a password reset link shortly.' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `Error occured: ${error.message}` }); 
    }
}

export const validatePasswordResetToken = async (req, res) => {
    const token = req.params.token;
    try {
        const user = await User.findOne({ resetPasswordToken: token });

        if(!user){
            return res.status(404).json({ msg: "Token is not found or invalid" });
        }

        if(user.resetPasswordExpires < Date.now()){
            user.resetPasswordExpires = null;
            user.resetPasswordToken = null;
            await user.save();
            return res.status(400).json({ msg: "Token has expired" });
        }

        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `Error occured: ${error.message}` }); 
    }
}

export const updatePassword = async (req, res) => {
    const result = validationResult(req);
    if(!result.isEmpty()){
        return res.status(400).json({ errorMessages: result.array() });
    }
    const { token, password } = matchedData(req);
    try {
        const user = await User.findOne({ resetPasswordToken: token });
        if(!user) {
            return res.status(404).json({ msg: "Token is not found or invalid" });
        }

        if(user.resetPasswordExpires < Date.now()){
            return res.status(400).json({ msg: "Token has expired" });
        }

        const hash = await bcrypt.hash(password, 12);

        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        user.password = hash;

        await user.save();

        return res.status(200).json({ msg: "Password updated successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `Error occured: ${error.message}` }); 
    }
}