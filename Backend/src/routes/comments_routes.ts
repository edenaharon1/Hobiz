import express from "express";
const router = express.Router();
import commentsController from "../controllers/comments_controller";
import { authMiddleware } from "../controllers/auth_controller";

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: The Comments API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique ID of the comment
 *           example: 661df73c64f7aa92c8f7e1a2
 *         content:
 *           type: string
 *           description: The content of the comment
 *           example: This is a great post!
 *         postId:
 *           type: string
 *           description: ID of the post this comment belongs to
 *           example: 661df6aa0c2b9d71e5dbb144
 *         owner:
 *           type: string
 *           description: ID of the user who wrote the comment
 *           example: 661dcd4f236cd49fa998bccc
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the comment was created
 *           example: "2024-04-21T08:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the comment was last updated
 *           example: "2024-04-21T09:00:00.000Z"
 *
 *     CommentInput:
 *       type: object
 *       required:
 *         - content
 *         - postId
 *       properties:
 *         content:
 *           type: string
 *           description: The content of the comment
 *           example: I totally agree with your point.
 *         postId:
 *           type: string
 *           description: The ID of the post the comment is associated with
 *           example: 661df6aa0c2b9d71e5dbb144
 */

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Retrieve all comments
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: A list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Server error
 */
router.get("/", commentsController.getAll.bind(commentsController));

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Retrieve a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to retrieve
 *     responses:
 *       200:
 *         description: The requested comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 */
router.get("/:id", commentsController.getById.bind(commentsController));

/**
 * @swagger
 * /comments/post/{postId}:
 *   get:
 *     summary: Retrieve all comments for a specific post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to retrieve comments for
 *     responses:
 *       200:
 *         description: A list of comments for the specified post
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.get("/post/:postId", commentsController.getByPostId.bind(commentsController));

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentInput'
 *     responses:
 *       201:
 *         description: The created comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, commentsController.create.bind(commentsController));

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to delete
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, commentsController.deleteItem.bind(commentsController));

export default router;
