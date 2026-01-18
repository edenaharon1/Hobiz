import { Request, Response } from "express";
import userModel from "../models/user_model";
import postModel from "../models/post_model";
import path from "path";
import fs from "fs/promises";

/**
 * Retrieve a user's profile and their posts by user ID
 * @param req - Request object containing the user ID in params
 * @param res - Response object
 * @returns User profile and associated posts
 */
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

/**
 * Update a user's profile information
 * @param req - Request object containing user ID in params and update data in body
 * @param res - Response object
 * @returns Updated user profile
 */
export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const { username, email, image } = req.body;

        console.log("updateUserProfile called");
        console.log("userId:", userId);
        console.log("req.body:", req.body);

        const updateFields: { username?: string, email?: string, image?: string } = {};
        if (username) {
            updateFields.username = username;
        }
        if (email) {
            updateFields.email = email;
        }
        if (image) {
            updateFields.image = image;
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            updateFields,
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

/**
 * Upload and update a user's profile image
 * @param req - Request object containing user ID in params and image file
 * @param res - Response object
 * @returns Success message and updated user image path
 */
export const uploadProfileImage = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No image file uploaded" });
        }

        const imagePath = req.file.path;
        user.image = path.relative(path.join(__dirname, "../../uploads"), imagePath).replace(/\\/g, '/');

        await user.save();

        res.status(200).json({ message: "Profile image uploaded successfully", user: { image: user.image } });

    } catch (error: any) {
        console.error("Error uploading profile image:", error);
        res.status(500).json({ message: "Failed to upload profile image", error: error.message });
    }
};

/**
 * Retrieve all posts created by a specific user
 * @param req - Request object containing user ID in params
 * @param res - Response object
 * @returns Array of posts created by the user
 */
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