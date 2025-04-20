import { Request, Response } from "express";
import commentsModel, { iComment } from "../models/comments_model";
import BaseController from "./base_controller";

class CommentsController extends BaseController<iComment> {
  constructor() {
    super(commentsModel);
  }

  async getById(req: Request, res: Response) {
    try {
        const commentId = req.params.id; // שימי לב לשם
        const comment = await commentsModel.findById(commentId);
        if (!comment) {
            res.status(404).json({ message: "Comment not found" });
            return;
        }
        res.status(200).json(comment);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Invalid comment ID" });
    }
}

async getByPostId(req: Request, res: Response) {
  try {
    const postId = req.params.postId;
    const comments = await commentsModel.find({ postId: postId }).populate('owner', 'username'); // אם את רוצה גם את פרטי הבעלים
    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching comments for post" });
  }
}


}

export default new CommentsController();
