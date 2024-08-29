import mongoose from "mongoose";
import User from "../mongoose/schemas/user.js";
import { Roles, Sort } from "../utils/enums.js";

export const getUser = async (req, res) => {
    const userId = req.params.userId ?? req.user.id;
    if(!mongoose.isValidObjectId(userId)) return res.status(400).json({ msg: "User id is not valid" });

    try {
        const user = await User.findById(userId, { fullName: true, username: true, email: true, profileImage: true, role: true });
        if(!user) return res.status(404).json({ msg: "User not found" });
        return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
}

export const getUsers = async (req, res) => {
    const { limit = 10, cursor, sort = Sort.NEWEST, role } = req.query;

    if(![Roles.MODERATOR, Roles.USER].includes(role)) return res.status(403).json({ msg: "role query param is not valid, it should be either 'user' or 'moderator'" })
    
    if(isNaN(limit)) return res.status(400).json({ msg: "limit query param must be a number" });

    const sortQuery = {};
    switch(sort){
        case Sort.NEWEST: 
            sortQuery._id = -1;
            break;
        case Sort.OLDEST:
            sortQuery._id = 1;
            break;
        default: 
            return res.status(400).json({ msg: "sort query param is not valid"})
    }

    const findQuery = { role };
    if(cursor){
        if(!mongoose.isValidObjectId(cursor)) return res.status(400).json({ msg: "cursor query param is not valid" });
        if(sort === Sort.NEWEST){
            findQuery._id = { $lt: cursor };
        } else {
            findQuery._id = { $gt: cursor };
        }
    }

    try {
        const users = await User.find(findQuery, { fullName: true, username: true, profileImage: true })
            .sort(sortQuery)
            .limit(limit)
            .exec();
        
        const length = users.length;
        const nextCursor = (length >= parseInt(limit)) ? users[length - 1]._id : null;

        return res.status(200).json({ cursor: nextCursor, users });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
}
