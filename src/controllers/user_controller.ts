import { Request, Response } from "express";
import userModel from "../models/user_model";
import postModel from "../models/post_model";

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;

        const user = await userModel.findById(userId);
        if (!user) {
            console.log("getUserProfile - User not found");
            return res.status(404).send("User not found");
        }

        const posts = await postModel.find({ owner: userId });
        console.log("getUserPosts - Found", posts.length, "posts");
        console.log("getUserPosts - Found posts:", posts);

        res.status(200).send({ user, posts });
    } catch (err) {
        res.status(400).send(err);
    }
};

export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const { username, profileImage } = req.body;

        console.log("updateUserProfile called");
        console.log("userId:", userId);
        console.log("req.body:", req.body);

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { username, profileImage },
            { new: true }
        );

        if (!updatedUser) {
            console.log("updateUserProfile - User not found");
            return res.status(404).send("User not found");
        }

        console.log("updateUserProfile - User updated successfully:", updatedUser);
        res.status(200).send(updatedUser);
    } catch (err) {
        console.error("updateUserProfile - Error:", err);
        res.status(400).send(err);
    }
};

// פונקציה חדשה לשליפת פוסטים של משתמש ספציפי
export const getUserPosts = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        console.log("getUserPosts - Received userId:", userId);

        const posts = await postModel.find({ owner: userId });
        console.log("getUserPosts - Found posts:", posts);

        if (!posts || posts.length === 0) {
            console.log("getUserPosts - Posts not found for this user");
            return res.status(404).send("Posts not found for this user");
        }

        res.status(200).send(posts);
    } catch (err) {
        console.error("getUserPosts - Error:", err);
        res.status(500).send(err);
    }
};