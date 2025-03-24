import postModel, { IPost } from "../models/post_model";
import { Request, Response } from "express";
import BaseController from "./base_controller";
import mongoose from "mongoose";

class PostsController extends BaseController<IPost> {
  constructor() {
    super(postModel);
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
        const userId = (req.user as { _id: string })._id;

        console.log(`Processing like request for postId: ${postId}, userId: ${userId}`);

        const post = await postModel.findById(postId);

        if (!post) {
            console.log(`Post not found for postId: ${postId}`);
            res.status(404).json({ message: "Post not found" });
            return;
        }

        console.log(`Found post: ${JSON.stringify(post)}`); // הוסף לוג כדי לראות את הפוסט שנמצא

        const userLiked = post.likedBy && post.likedBy.includes(userId);

        if (userLiked) {
            post.likedBy = post.likedBy.filter((id) => id !== userId);
            post.likesCount = Math.max(0, post.likesCount - 1); // ודא ש-likesCount לא שלילי
            console.log(`User ${userId} unliked post ${postId}. New likesCount: ${post.likesCount}`);
        } else {
            if (!post.likedBy) {
                post.likedBy = [];
            }
            post.likedBy.push(userId);
            post.likesCount++;
            console.log(`User ${userId} liked post ${postId}. New likesCount: ${post.likesCount}`);
        }

        await post.save(); // שמירת השינויים במסד הנתונים

        console.log(`Post ${postId} updated successfully. New post data: ${JSON.stringify(post)}`); // הוסף לוג כדי לראות את הפוסט לאחר העדכון

        // ודא שאתה שולח את likedBy כראוי
        res.json({ likesCount: post.likesCount, likedBy: post.likedBy || [] });
        console.log(`Post ${postId} updated successfully. Response sent: ${JSON.stringify({ likesCount: post.likesCount, likedBy: post.likedBy || [] })}`); // הוסף לוג כדי לראות את התגובה שנשלחה

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
    console.log("req.body:", req.body); // הוסף לוג כאן
    console.log("req.user in update (start):", req.user);

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
        const image = req.file ? `/uploads/${req.file.filename}` : undefined;

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