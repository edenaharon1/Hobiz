import { NextFunction, Request, Response } from 'express';
import userModel, { IUser } from '../models/user_model';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { Document } from 'mongoose';

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

const register = async (req: Request, res: Response) => {
    try {
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await userModel.create({
            email: req.body.email,
            password: hashedPassword,
        });

        // Generate token after user creation
        const tokens = generateToken(user._id.toString()); // user._id is an object, so convert to string

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

const login = async (req: Request, res: Response) => {
    try {
        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
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
        // generate token
        const tokens = generateToken(user._id);
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
const verifyRefreshToken = (refreshToken: string | undefined) => {
    return new Promise<tUser>((resolve, reject) => {
        //get refresh token from body
        if (!refreshToken) {
            reject('fail');
            return;
        }
        //verify token
        if (!process.env.TOKEN_SECRET) {
            reject('fail');
            return;
        }
        jwt.verify(refreshToken, process.env.TOKEN_SECRET, async (err: any, payload: any) => {
            if (err) {
                reject('fail');
                return;
            }
            //get the user id fromn token
            const userId = payload._id;
            try {
                //get the user form the db
                const user = await userModel.findById(userId);
                if (!user) {
                    reject('fail');
                    return;
                }
                if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
                    user.refreshToken =[];
                    await user.save();
                    reject('fail');
                    return;
                }
                const tokens = user.refreshToken!.filter((token) => token !== refreshToken);
                user.refreshToken = tokens;

                resolve(user);
            } catch (err) {
                reject('fail');
                return;
            }
        });
    });
};

const logout = async (req: Request, res: Response) => {
    try {
        const user = await verifyRefreshToken(req.body.refreshToken);
        await user.save();
        res.status(200).send('success');
    } catch (err) {
        res.status(400).send('fail');
    }
};

const refresh = async (req: Request, res: Response) => {
    try {
        const user = await verifyRefreshToken(req.body.refreshToken);
        if (!user) {
            res.status(400).send('fail');
            return;
        }
        const tokens = generateToken(user._id);

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
        //send new token
    } catch (err) {
        res.status(400).send('fail');
    }
};

type Payload = {
    _id: string;
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.header('authorization');
    const token = authorization && authorization.split(' ')[1];

    console.log("Token received:", token);

    if (!token) {
        console.log("Token not provided");
        res.status(401).send('Access Denied');
        return;
    }

    if (!process.env.TOKEN_SECRET) {
        console.error("TOKEN_SECRET is not defined");
        res.status(500).send('Server Error');
        return;
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
        if (err) {
            console.log("Token verification failed:", err);
            res.status(401).send('Access Denied');
            return;
        }

        console.log("Token payload:", payload); // הדפסה אחת מספיקה
        req.user = (payload as Payload)._id; // הקצאה אחת מספיקה
        next();
    });
};

export default {
    register: register as (req: Request, res: Response) => Promise<void>,
    login: login as (req: Request, res: Response) => Promise<void>,
    refresh: refresh as (req: Request, res: Response) => Promise<void>,
    logout: logout as (req: Request, res: Response) => Promise<void>,

};