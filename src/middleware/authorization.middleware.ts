import { Request, Response, NextFunction } from 'express';
import Post from '../models/post_model';

export const authorizePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const postId = req.params.id;
        const userId = req.params.userId;
        const post = await Post.findById(postId);

        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return next(); // חשוב להשתמש ב-next כדי לסיים את ה-middleware
        }

        if (post.owner !== userId) {
            res.status(403).json({ message: 'Unauthorized' });
            return next(); // חשוב להשתמש ב-next כדי לסיים את ה-middleware
        }

        return next(); // מעבר ל-middleware הבא אם הכל תקין
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return next(error); // העברת השגיאה ל-middleware הבא
    }
};