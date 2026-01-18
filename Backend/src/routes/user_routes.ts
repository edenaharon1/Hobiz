import express, { Request, Response, NextFunction } from "express";
import { getUserProfile, updateUserProfile, getUserPosts, uploadProfileImage } from "../controllers/user_controller";
import { authMiddleware as verifyToken } from "../controllers/auth_controller";
import multer from "multer";
import path from "path";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: users
 *     description: The users API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - _id
 *         - email
 *         - username
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         _id:
 *           type: string
 *           description: The ID of the user
 *           example: "60b8d6c3f9f1f7f1c8f5b0c6"
 *         email:
 *           type: string
 *           description: The email of the user
 *           example: "user@example.com"
 *         username:
 *           type: string
 *           description: The username of the user
 *           example: "user123"
 *         image:
 *           type: string
 *           description: The URL to the user's profile image
 *           example: "http://localhost:3001/uploads/12345678-profile.jpg"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the user was created
 *           example: "2024-04-21T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the user was last updated
 *           example: "2024-04-21T11:00:00.000Z"
 * 
 *     UserInput:
 *       type: object
 *       required:
 *         - username
 *       properties:
 *         username:
 *           type: string
 *           description: The username of the user
 *           example: "newusername"
 *         email:
 *           type: string
 *           description: The email of the user
 *           example: "newemail@example.com"
 *         image:
 *           type: string
 *           format: binary
 *           description: The new profile image of the user (optional)
 */
 
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

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Retrieve a user's profile by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: The user's profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
// ניתוב עבור פרופיל משתמש (לפי id)
router.get("/:id", asyncHandler(getUserProfile));

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user's profile by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       200:
 *         description: The updated user's profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
// ניתוב עבור עדכון פרופיל משתמש (לפי id, דורש אימות טוקן)
router.put("/:id", verifyToken, asyncHandler(updateUserProfile));

/**
 * @swagger
 * /users/image/{id}:
 *   put:
 *     summary: Upload or update a user's profile image
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update the profile image for
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: The user's profile image was updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: No profile image uploaded
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
// ניתוב עבור העלאת תמונת פרופיל (לפי userId, דורש אימות טוקן ו-multer)
router.put("/image/:id", verifyToken, upload.single("profileImage"), asyncHandler(uploadProfileImage));

router.use((req: Request, res: Response, next: NextFunction) => {
    console.log("Received request in user_routes:", req.method, req.url);
    next();
});
/**
 * @swagger
 * /users/{userId}/posts:
 *   get:
 *     summary: Retrieve all posts created by a specific user
 *     description: Returns a list of all posts authored by the specified user.
 *     tags:
 *       - Users
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The unique identifier of the user
 *         schema:
 *           type: string
 *           example: "60b8d6c3f9f1f7f1c8f5b0c6"
 *     responses:
 *       200:
 *         description: A list of posts created by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       404:
 *         description: No posts were found for the specified user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No posts found for this user
 *       500:
 *         description: Server error while retrieving user's posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 *                 error:
 *                   type: string
 *                   example: Error details here
 */

router.get("/:userId/posts", asyncHandler(getUserPosts));


export default router;
