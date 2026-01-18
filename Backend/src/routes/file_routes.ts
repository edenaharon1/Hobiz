import express from "express";
const router = express.Router();
import multer from "multer";
import path from "path";
import fs from "fs";
import userModel from "../models/user_model";
import { authMiddleware } from "../controllers/auth_controller"; // אם תרצה לאבטח את הנתיב

const DEFAULT_DOMAIN = "http://localhost:3001"; // הגדר את הדומיין שלך כאן

/**
 * @swagger
 * tags:
 *   - name: Files
 *     description: The files API
 */

const base = process.env.DOMAIN_BASE
    ? process.env.DOMAIN_BASE.endsWith('/')
        ? process.env.DOMAIN_BASE
        : `${process.env.DOMAIN_BASE}/`
    : DEFAULT_DOMAIN;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../../uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });
/**
 * @swagger
 * /files:
 *   post:
 *     summary: Upload a file
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
*         multipart/form-data:
*           schema:
*             type: object
*             properties:
*               file:
*                 type: string
*                 format: binary
*     responses:
*       200:
*         description: File uploaded successfully
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 url:
*                   type: string
*                   description: The URL of the uploaded file
*       400:
*         description: No file uploaded
*       500:
*         description: File upload failed
*/
router.post('/', upload.single("file"), (req, res) => {
    if (!req.file) {
        res.status(400).send({ error: "No file uploaded." });
        return;
    }

    const relativePath = path.posix.join("uploads", req.file.filename);
    const imageUrl = base + relativePath;

    fs.access(req.file.path, fs.constants.F_OK, (err) => {
        if (err) {
            console.error("File not found after upload:", err);
            res.status(500).send({ error: "File upload failed." });
            return;
        }

        console.log("Uploaded file URL:", imageUrl);
        res.status(200).send({ url: imageUrl });
    });
});
/**
 * @swagger
 * /files/users/image/{userId}:
 *   put:
 *     summary: Update a user's profile image
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
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
*         description: User profile image updated successfully
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 user:
*                   $ref: '#/components/schemas/User'
*       400:
*         description: No profile image uploaded
*       404:
*         description: User not found
*       500:
*         description: Failed to update profile image
*/
// נתיב לעדכון תמונת פרופיל משתמש
router.put('/users/image/:userId', authMiddleware, upload.single("profileImage"), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).send({ error: "No profile image uploaded." });
            return;
        }

        const relativePath = path.posix.join("uploads", req.file.filename);
        const imageUrl = base + relativePath;
        const userId = req.params.userId;

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { image: imageUrl },
            { new: true }
        );

        if (!updatedUser) {
            res.status(404).send({ error: "User not found." });
            return;
        }

        console.log("Updated user profile image:", imageUrl);
        res.status(200).send({ user: updatedUser });
    } catch (error) {
        console.error("Error updating user profile image:", error);
        res.status(500).send({ error: "Failed to update profile image." });
    }
});

export default router;