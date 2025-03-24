import express, { Request, Response, NextFunction } from "express";
import { getUserProfile, updateUserProfile, getUserPosts } from "../controllers/user_controller";
import { authMiddleware as verifyToken } from "../controllers/auth_controller";

const router = express.Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// ניתוב עבור פרופיל משתמש (לפי id)
router.get("/:id", asyncHandler(getUserProfile));

// ניתוב עבור עדכון פרופיל משתמש (לפי id, דורש אימות טוקן)
router.put("/:id", verifyToken, asyncHandler(updateUserProfile));

// ניתוב עבור שליפת פוסטים של משתמש (לפי userId)
router.get("/posts/user/:userId", asyncHandler(getUserPosts));
router.use((req: Request, res: Response, next: NextFunction) => {
    console.log("Received request in user_routes:", req.method, req.url);
    next();
});

export default router;