import express, { Request, Response, NextFunction } from "express";
import { getUserProfile, updateUserProfile, getUserPosts, uploadProfileImage } from "../controllers/user_controller";
import { authMiddleware as verifyToken } from "../controllers/auth_controller";
import multer from "multer";
import path from "path";

const router = express.Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// הגדרת אחסון עבור תמונות פרופיל (דומה להגדרת אחסון עבור פוסטים)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../uploads")); // שימוש באותה תיקיית uploads
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// ניתוב עבור פרופיל משתמש (לפי id)
router.get("/:id", asyncHandler(getUserProfile));

// ניתוב עבור עדכון פרופיל משתמש (לפי id, דורש אימות טוקן)
router.put("/:id", verifyToken, asyncHandler(updateUserProfile));

// ניתוב עבור העלאת תמונת פרופיל (לפי userId, דורש אימות טוקן ו-multer)
router.put("/image/:id", verifyToken, upload.single("profileImage"), asyncHandler(uploadProfileImage)); // שימו לב ל-upload.single("profileImage")

// ניתוב עבור שליפת פוסטים של משתמש (לפי userId)
router.get("/posts/user/:userId", asyncHandler(getUserPosts));

router.use((req: Request, res: Response, next: NextFunction) => {
    console.log("Received request in user_routes:", req.method, req.url);
    next();
});

export default router;