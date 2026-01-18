import { NextFunction, Request, Response } from 'express';
import userModel, { IUser } from '../models/user_model';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { Document } from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Handles user registration via Google Sign-Up. Verifies the provided Google ID token,
 * checks for existing users by email, and creates a new user with a generated password.
 * If successful, it returns newly issued access and refresh tokens along with the user ID.
 *
 * @param req - Express request object containing the Google ID token in the body.
 * @param res - Express response object used to return success or error status and messages.
 * @returns A JSON response with accessToken, refreshToken, and the newly created user ID on success.
 */
const googleSignUp = async (req: Request, res: Response) => {
    console.log('googleSignUp function called');
    try {
        const { token } = req.body;

        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.status(500).send('Server Error: GOOGLE_CLIENT_ID not configured');
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).send('Invalid Google ID token');
        }

        const { email, name } = payload;

        let existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).send('User with this email already exists');
        }

        const randomPassword = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);

        const newUser = await userModel.create({
            email,
            username: name,
            password: hashedPassword,
        });

        const tokens = generateToken(newUser._id.toString());
        if (!tokens) {
            return res.status(500).send('Server Error: Token generation failed');
        }

        res.status(200).json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            _id: newUser._id,
        });

    } catch (error) {
        console.error('Error in Google sign-up:', error);
        res.status(400).send('Google sign-up failed');
    }
};

/**
 * Handles user login via Google OAuth. Verifies the Google ID token,
 * finds or creates a user, and returns access and refresh tokens.
 *
 * @param req - Express request object containing the Google ID token in the body.
 * @param res - Express response object used to return success or error status and messages.
 * @returns A JSON response with accessToken, refreshToken, and user ID on success.
 */
const googleLogin = async (req: Request, res: Response) => {
    console.log('googleLogin function called');
    try {
        const { token } = req.body;

        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.status(500).send('Server Error: GOOGLE_CLIENT_ID not configured');
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).send('Invalid Google ID token');
        }

        const { email, name } = payload;

        let user = await userModel.findOne({ email });

        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = await userModel.create({
                email,
                username: name,
                password: hashedPassword,
            });
        }

        const tokens = generateToken(user._id.toString());
        if (!tokens) {
            return res.status(500).send('Server Error: Token generation failed');
        }

        res.status(200).json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            _id: user._id,
        });

    } catch (error) {
        console.error('Error in Google login:', error);
        res.status(400).send('Google login failed');
    }
};

/**
 * Generates access and refresh tokens for a user
 *
 * @param userId - The user's ID to include in the token payload
 * @returns An object containing accessToken and refreshToken, or null if generation fails
 */
const generateToken = (userId: string): { accessToken: string; refreshToken: string } | null => {
    if (!process.env.TOKEN_SECRET || !process.env.TOKEN_EXPIRES || !process.env.REFRESH_TOKEN_EXPIRES) {
        return null;
    }

    const random = Math.random().toString();

    try {
        const accessToken = jwt.sign(
            {
                _id: userId,
                random: random,
            },
            process.env.TOKEN_SECRET as Secret,
            { expiresIn: parseInt(process.env.TOKEN_EXPIRES) }
        );

        const refreshToken = jwt.sign(
            {
                _id: userId,
                random: random,
            },
            process.env.TOKEN_SECRET as Secret,
            { expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRES) }
        );

        return {
            accessToken: accessToken,
            refreshToken: refreshToken,
        };
    } catch (error) {
        console.error('Error generating tokens:', error);
        return null;
    }
};

/**
 * Handles user registration with email and password
 *
 * @param req - Express request object containing username, email, and password in the body
 * @param res - Express response object
 * @returns User object and tokens on success
 */
const register = async (req: Request, res: Response) => {
    try {
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await userModel.create({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });
        
        const tokens = generateToken(user._id.toString());

        if (!tokens) {
            return res.status(500).send('Server Error: Token generation failed');
        }

        res.status(200).send({
            user: user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });
    } catch (err) {
        res.status(400).send(err);
    }
};

/**
 * Handles user login with email and password
 *
 * @param req - Express request object containing email and password in the body
 * @param res - Express response object
 * @returns Access and refresh tokens on successful login
 */
const login = async (req: Request, res: Response) => {
    try {
        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            res.status(400).send('wrong username or password');
            return;
        }
        if (!user.password) {
            res.status(400).send('wrong username or password');
            return;
        }
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            res.status(400).send('wrong username or password');
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            res.status(500).send('Server Error');
            return;
        }
        const tokens = generateToken(user._id.toString());
        if (!tokens) {
            res.status(500).send('Server Error');
            return;
        }
        if (!user.refreshToken) {
            user.refreshToken =[];
        }
        user.refreshToken.push(tokens.refreshToken);
        await user.save();
        res.status(200).send({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            _id: user._id,
        });
    } catch (err) {
        res.status(400).send(err);
    }
};

type tUser = Document<unknown, {}, IUser> &
    IUser &
    Required<{
        _id: string;
    }> & {
        __v: number;
    };

/**
 * Verifies a refresh token and returns the associated user
 *
 * @param refreshToken - The refresh token to verify
 * @returns A Promise that resolves with the user object or rejects with 'fail'
 */
const verifyRefreshToken = (refreshToken: string | undefined) => {
    return new Promise<tUser>(async (resolve, reject) => {
        console.log("🔑 Checking refreshToken:", refreshToken);
        if (!refreshToken || !process.env.TOKEN_SECRET) {
            console.log("🔒 refreshToken missing or TOKEN_SECRET not configured");
            return reject('fail');
        }

        jwt.verify(refreshToken, process.env.TOKEN_SECRET, async (err: any, payload: any) => {
            if (err) {
                return reject('fail');
            }

            const userId = payload._id;

            try {
                const user = await userModel.findById(userId);
                if (!user) {
                    return reject('fail');
                }

                console.log("👤 User found:", user);
                console.log("currentToken for comparison:", refreshToken);
                console.log("User's refreshToken:", user.refreshToken);

                if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
                    user.refreshToken = [];
                    await user.save();
                    return reject('fail');
                }

                user.refreshToken = user.refreshToken.filter(token => token !== refreshToken);
                await user.save();

                const updatedUser = await userModel.findById(userId);
                if (!updatedUser) {
                    return reject('fail');
                }

                resolve({
                    ...updatedUser.toObject(),
                    _id: updatedUser._id.toString(),
                } as tUser);
            } catch (err) {
                return reject('fail');
            }
        });
    });
};

/**
 * Handles user logout by verifying and invalidating the refresh token
 *
 * @param req - Express request object containing the refresh token in the body
 * @param res - Express response object
 * @returns Success or failure message
 */
const logout = async (req: Request, res: Response) => {
    try {
        await verifyRefreshToken(req.body.refreshToken);
        res.status(200).send('success');
    } catch (err) {
        res.status(400).send('fail');
    }
};

/**
 * Refreshes access and refresh tokens using a valid refresh token
 *
 * @param req - Express request object containing the refresh token in the body
 * @param res - Express response object
 * @returns New access and refresh tokens on success
 */
const refresh = async (req: Request, res: Response) => {
    try {
        const user = await verifyRefreshToken(req.body.refreshToken);
        if (!user) {
            return res.status(400).send({ error: 'Refresh failed - invalid token' });
        }
        const tokens = generateToken(user._id);

        if (!tokens) {
            return res.status(500).send({ error: 'Server Error - token generation failed' });
        }
        if (!user.refreshToken) {
            user.refreshToken =[];
        }
        user.refreshToken.push(tokens.refreshToken);
        await user.save();
        res.status(200).send({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            _id: user._id,
        });
    } catch (err) {
        res.status(400).send({ error: 'Refresh failed - exception' });
    }
};

type Payload = {
    _id: string;
};

/**
 * Middleware to authenticate requests using JWT tokens
 *
 * @param req - Express request object containing the authorization header
 * @param res - Express response object
 * @param next - Express next function to continue to the next middleware
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    console.log("🚀 Starting authentication middleware");
  
    const authHeader = req.header('authorization');
    console.log("Authorization header:", authHeader);
  
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;
  
    console.log("Token extracted:", token);
  
    if (!token) {
      console.log("❌ No token provided");
      res.status(401).send('Access Denied');
      return;
    }
  
    const secret = process.env.TOKEN_SECRET;
    if (!secret) {
      console.error("❌ TOKEN_SECRET is not defined");
      res.status(500).send('Server Error');
      return;
    }
  
    jwt.verify(token, secret, (err, payload) => {
      if (err) {
        console.log("❌ Token verification failed:", err.message);
        res.status(401).send('Access Denied');
        return;
      }
      console.log("Token payload:", payload);
      const { _id } = payload as Payload;
      console.log("✅ Token payload, user ID:", _id);
  
      req.user = _id;
      next();
    });
  };

export default {
    register: register as (req: Request, res: Response) => Promise<void>,
    login: login as (req: Request, res: Response) => Promise<void>,
    refresh: refresh as (req: Request, res: Response) => Promise<void>,
    logout: logout as (req: Request, res: Response) => Promise<void>,
    googleLogin: googleLogin as (req: Request, res: Response) => Promise<void>,
    googleSignUp: googleSignUp as (req: Request, res: Response) => Promise<void>,
};