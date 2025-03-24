import { Request, Response } from "express";
import commentsModel, { iComment } from "../models/comments_model";
import BaseController from "./base_controller";

class CommentsController extends BaseController<iComment> {
  constructor() {
    super(commentsModel);
  }


  async getById(req: Request, res: Response) {
    try {
      const postId = req.params.postId;
      const comments = await commentsModel.find({ postId: postId });
      if (!comments) {
        // אם לא נמצאו תגובות עבור הפוסט, החזר 404
         res.status(404).json({ message: "Comments not found for this post" });
         return;
      }

      res.status(200).json(comments);
    } catch (error) {
      console.error(error);
      // אם אירעה שגיאה בשאילתה ל-MongoDB, החזר 500
      res.status(500).json({ message: "Internal server error" });
    }
  }
}


export default new CommentsController();