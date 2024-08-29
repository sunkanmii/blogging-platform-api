import mongoose from "mongoose";
import User from "../mongoose/schemas/user.js";

export const getUser = async (req, res) => {
    const userId = req.params.userId ?? req.user.id;
    if(!mongoose.isValidObjectId(userId)) return res.status(400).json({ msg: "User id is not valid" });

    try {
        const user = await User.findById(userId, { fullName: true, username: true, email: true, profileImage: true, role: true });
        if(!user) return res.status(404).json({ msg: "User not found" });
        return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
}