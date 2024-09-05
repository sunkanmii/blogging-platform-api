import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import User from '../mongoose/schemas/user.js';
import { matchedData, validationResult } from "express-validator";
import { generateAccessToken, generateRefreshToken } from '../utils/auth.js';
import nodemailer from 'nodemailer';
import { readFileSync } from 'node:fs';
import path from 'node:path';

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
            id: newUser._id,
            fullName: newUser.fullName, 
            username: newUser.username, 
            email: newUser.email, 
            profileImage: newUser.profileImage, 
            role: newUser.role
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
        
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD
            }
        });

        const resetLink = `${process.env.FRONTEND_URL}/password-reset/${token}`;

        const emailHtml = readFileSync(path.join(import.meta.dirname, '../templates/emails/password-reset.html'), 'utf-8');
        
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Reset your password",
            text: `You recently requested to reset your password. \nClick on the link below to proceed: \n${resetLink} \nThis link will expire after one hour.\nIf you didn\'t request this, please ignore this email.`,
            html: emailHtml.replace('{{resetLink}}', resetLink)
        })

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

        const hash = await bcrypt.hash(password, 10);

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