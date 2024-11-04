import User from "../mongoose/schemas/user.js";
import jwt from 'jsonwebtoken';
import { generateAccessToken } from '../utils/auth.js';

// checks if there is a valid refresh token, then generate a new access token, attach it to the req object, then call newt(), else return a 4** status code response
const checkRefreshToken = async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided, please log in again' });
    }

    try {
        const foundUser = await User.findOne({ refreshTokens: { $in: [refreshToken] } });

        if (!foundUser) {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'None'
            });
            return res.status(404).json({ message: 'refresh token is not found' });
        }

        jwt.verify(refreshToken, process.env.JWT_SECRET_KEY, async (error) => {
            if (error) {
                if (error.name === "TokenExpiredError") {
                    // Remove expired refresh token from user record
                    foundUser.refreshTokens.pull(refreshToken);
                    await foundUser.save();
                }
                res.clearCookie('refreshToken', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'None'
                });
                return res.status(400).json({ message: 'Invalid or expired refresh token' });
            }

            // Generate new access token and attach to request
            const theUser = {
                id: foundUser._id,
                fullName: foundUser.fullName,
                username: foundUser.username,
                email: foundUser.email,
                profileImage: foundUser.profileImage,
                role: foundUser.role
            }
            const accessToken = generateAccessToken(theUser);

            req.user = theUser; // Attach the user info to the request
            req.newAccessToken = accessToken; // Attach the new access token to the request

            return next();
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `Error occured while refresh token process: ${error.message}` });
    }
}

export default checkRefreshToken;