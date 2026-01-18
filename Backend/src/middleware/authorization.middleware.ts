import { Request, Response, NextFunction } from 'express';
import Post from '../models/post_model';

/**
 * Middleware to authorize post operations by verifying that the user is the owner of the post
 * 
 * @param req - Express request object containing post ID and user ID in params
 * @param res - Express response object
 * @param next - Express next function to continue to the next middleware
 */
export const authorizePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const postId = req.params.id;
        const userId = req.params.userId;
        const post = await Post.findById(postId);

        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return next();
        }

        if (post.owner !== userId) {
            res.status(403).json({ message: 'Unauthorized' });
            return next();
        }

        return next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return next(error);
    }
};