import postModel, { IPost } from "../models/post_model";
import { Request, Response } from "express";
import BaseController from "./base_controller";
import mongoose from "mongoose";
import commentModel from "../models/comments_model"; // ייבוא מודל התגובות

class PostsController extends BaseController<IPost> {
    constructor() {
        super(postModel);
    }

    async getAll(req: Request, res: Response) {
        try {
            const posts = await postModel.aggregate([
                {
                    $lookup: {
                        from: 'comments',
                        localField: '_id',
                        foreignField: 'postId',
                        as: 'postComments'
                    }
                },
                {
                    $addFields: {
                        commentsCount: { $size: '$postComments' }
                    }
                },
                {
                    $project: {
                        postComments: 0 // אל תכלול את מערך התגובות המלא
                    }
                }
            ]);
            res.json(posts);
        } catch (error) {
            console.error("Error fetching posts with comment counts:", error);
            res.status(500).json({ message: "Failed to fetch posts." });
        }
    };

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const postId = req.params.id;
            const post = await postModel.findById(postId);
            if (!post) {
                res.status(404).json({ message: "Post not found." });
                return;
            }
            const comments = await commentModel.find({ postId: postId });
            res.json({ ...post.toObject(), comments });
        } catch (error) {
            console.error("Error fetching post by ID with comments:", error);
            res.status(500).json({ message: "Failed to fetch post." });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const { title, content, owner, image } = req.body; // קבל את ה-URL של התמונה מ-req.body

            if (!title || !content || !owner) {
                res.status(400).json({ message: "Missing required fields." });
                return;
            }

            const post = await postModel.create({ title, content, owner, image });
            res.status(201).json(post);
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                res.status(400).json({ message: error.message });
                return;
            }
            console.error("Error creating post:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    }


    async likePost(req: Request, res: Response): Promise<void> {
        try {
            const postId = req.params.id;
            if (!req.user) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const userId = req.user;
            console.log("User ID from token:", userId);
            console.log(`Processing like request for postId: ${postId}, userId: ${userId}`);
            console.log("userId:", userId, "typeof userId:", typeof userId);

            const post = await postModel.findById(postId);

            if (!post) {
                console.log(`Post not found for postId: ${postId}`);
                res.status(404).json({ message: "Post not found" });
                return;
            }

            if (post.likedBy) {
                post.likedBy = post.likedBy.filter(id => id !== null);
            }

            console.log(`Found post: ${JSON.stringify(post)}`);

            console.log("post.likedBy:", post.likedBy);
            // בדיקה אם המשתמש כבר לייקק את הפוסט
            let userLiked = false;
            if (post.likedBy) {
                for (let i = 0; i < post.likedBy.length; i++) {
                    if (post.likedBy[i].toString() === userId.toString()) {
                        userLiked = true;
                        break;
                    }
                }
            }
            console.log(`User liked: ${userLiked}`);

            // עדכון כמות הלייקים ו-likedBy
            if (userLiked) {
                // אם המשתמש כבר לייקק את הפוסט, הסר את הלייק
                post.likedBy = post.likedBy.filter((id) => id.toString() !== userId.toString());
                post.likesCount = Math.max(0, post.likesCount - 1);
                console.log(`User ${userId} unliked post ${postId}. New likesCount: ${post.likesCount}`);
            } else {
                // אם המשתמש לא לייקק את הפוסט, הוסף את הלייק
                if (!post.likedBy) {
                    post.likedBy = [];
                }
                post.likedBy.push(userId.toString());
                post.likesCount++;
                console.log(`User ${userId} liked post ${postId}. New likesCount: ${post.likesCount}`);
            }

            console.log(`Post before save: ${JSON.stringify(post)}`);

            // שמירת השינויים במסד נתונים
            await post.save();

            console.log(`Post ${postId} updated successfully. New post data: ${JSON.stringify(post)}`);

            // שליחת תגובה עם כמות הלייקים המעודכנת ו-likedBy
            res.json({ likesCount: post.likesCount, likedBy: post.likedBy || [] });
            console.log(`Post ${postId} updated successfully. Response sent: ${JSON.stringify({ likesCount: post.likesCount, likedBy: post.likedBy || [] })}`);

        } catch (error) {
            if (error instanceof Error) {
                console.error(`Error liking post: ${error.message}`);
                res.status(500).json({ message: error.message });
            } else {
                console.error(`Error liking post: ${String(error)}`);
                res.status(500).json({ message: "An unknown error occurred." });
            }
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        console.log("--- Starting update function ---");
        console.log("req.params:", req.params);
        console.log("req.body (before multer):", req.body);
        console.log("req.file (before check):", req.file)

        try {
            const postId = req.params.id;
            console.log("Received update request for post ID:", postId);
            console.log("Auth Token:", req.headers.authorization);

            console.log("Type of req.user:", typeof req.user);
            console.log("Value of req.user:", req.user);

            const post = await postModel.findById(postId);
            if (!post) {
                res.status(404).json({ message: "Post not found" });
                return;
            }

            console.log("Type of post.owner:", typeof post.owner.toString());
            console.log("Value of post.owner:", post.owner.toString());

            if (post.owner.toString() !== req.user) {
                res.status(401).json({ message: "Not authorized" });
                return;
            }

            const { title, content } = req.body;
            const image = req.file ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`: undefined;

            console.log("Image path after multer:", image);
            console.log("Title from request:", title);
            console.log("Content from request:", content);
            console.log("Image from request:", image);

            console.log("Post before update:", post); // לוג של הפוסט לפני העדכון

            const updatedPost = await postModel.findByIdAndUpdate(
                postId,
                {
                    title: title || post.title,
                    content: content || post.content,
                    image: image || post.image,
                },
                { new: true }
            );

            console.log("Updated post from findByIdAndUpdate:", updatedPost); // לוג של הפוסט אחרי העדכון

            if (!updatedPost) {
                res.status(500).json({ message: "Failed to update post." });
                return;
            }

            res.json(updatedPost);
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                res.status(400).json({ message: error.message });
                return;
            }
            console.error("Error updating post:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    }
}

export default new PostsController();