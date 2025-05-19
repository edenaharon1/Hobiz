import express from "express";
const router = express.Router();
import authController from "../controllers/auth_controller";

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: The Authentication API
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: The user email
 *           example: 'bob@gmail.com'
 *         password:
 *           type: string
 *           description: The user password
 *           example: '123456'
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registers a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The new user created successfully with access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 accessToken:
 *                   type: string
 *                   description: The access token for the user
 *                 refreshToken:
 *                   type: string
 *                   description: The refresh token for the user
 *       400:
 *         description: Bad request, invalid user data
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login for an existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user email
 *               password:
 *                 type: string
 *                 description: The user password
 *     responses:
 *       200:
 *         description: The user logged in successfully with access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The access token for the user
 *                 refreshToken:
 *                   type: string
 *                   description: The refresh token for the user
 *       400:
 *         description: Invalid username or password
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout and invalidate the refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token to invalidate
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       400:
 *         description: Invalid refresh token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh the access token using the refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token to generate a new access token
 *     responses:
 *       200:
 *         description: Successfully refreshed access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The new access token
 *                 refreshToken:
 *                   type: string
 *                   description: The new refresh token
 *       400:
 *         description: Invalid refresh token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/google-login:
 *   post:
 *     summary: Login with Google account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google ID token
 *     responses:
 *       200:
 *         description: Successfully logged in with Google account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The access token for the user
 *                 refreshToken:
 *                   type: string
 *                   description: The refresh token for the user
 *       400:
 *         description: Invalid Google token or user already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/google-signup:
 *   post:
 *     summary: Sign up with Google account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google ID token
 *     responses:
 *       200:
 *         description: Successfully signed up with Google account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The access token for the user
 *                 refreshToken:
 *                   type: string
 *                   description: The refresh token for the user
 *       400:
 *         description: Invalid Google token or user already exists
 *       500:
 *         description: Server error
 */

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);
router.post("/google-login", authController.googleLogin);
router.post("/google-signup", authController.googleSignUp);

export default router;
