import { NextFunction, Request, Response } from 'express';
import userModel, { IUser } from '../models/user_model';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { Document } from 'mongoose';
import { OAuth2Client } from 'google-auth-library'; // ייבוא ספריית האוטנטיקציה של גוגל
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // אתחול לקוח OAuth2

const googleSignUp = async (req: Request, res: Response) => {
    console.log('googleSignUp function called');
    try {
        const { token } = req.body;

        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.status(500).send('שגיאת שרת: GOOGLE_CLIENT_ID לא הוגדר');
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).send('ID token לא תקין של גוגל');
        }

        const { email, name } = payload;

        // בדוק אם משתמש עם האימייל הזה כבר קיים
        let existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).send('משתמש עם האימייל הזה כבר קיים'); // Conflict
        }

        // צור משתמש חדש
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
            return res.status(500).send('שגיאת שרת: הנפקת טוקנים נכשלה');
        }

        res.status(200).json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            _id: newUser._id,
        });

    } catch (error) {
        console.error('שגיאה ברישום עם גוגל:', error);
        res.status(400).send('רישום עם גוגל נכשל');
    }
};

const googleLogin = async (req: Request, res: Response) => {
    console.log('googleLogin function called');
    try {
        const { token } = req.body; // קבלת ה-ID token מהבקשה

        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.status(500).send('שגיאת שרת: GOOGLE_CLIENT_ID לא הוגדר');
        }

        const ticket = await client.verifyIdToken({ // אימות ה-ID token מול גוגל
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).send('ID token לא תקין של גוגל');
        }

        const { email, name } = payload; // חילוץ פרטי המשתמש

        let user = await userModel.findOne({ email }); // בדיקה אם משתמש קיים כבר

        if (!user) { // אם המשתמש לא קיים, צור משתמש חדש
            // צור סיסמה רנדומלית (או שתחליט לא לאפשר התחברות עם סיסמה)
            const randomPassword = Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = await userModel.create({
                email,
                username: name,
                password: hashedPassword, // שמור את הסיסמה הרנדומלית
                // ... שדות נוספים אם יש
            });
        }

        // הנפקת טוקנים (accessToken ו-refreshToken)
        const tokens = generateToken(user._id.toString());
        if (!tokens) {
            return res.status(500).send('שגיאת שרת: הנפקת טוקנים נכשלה');
        }

        res.status(200).json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            _id: user._id,
        });

    } catch (error) {
        console.error('שגיאה בהתחברות עם גוגל:', error);
        res.status(400).send('התחברות עם גוגל נכשלה');
    }
};

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
            username: req.body.username, // ⬅️ שדה השם שנשלח מהקליינט
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
        // generate token
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

    
    const verifyRefreshToken = (refreshToken: string | undefined) => {
        return new Promise<tUser>(async (resolve, reject) => {
            console.log("🔑 בודק refreshToken:", refreshToken); // הוסף לוג כאן
            if (!refreshToken || !process.env.TOKEN_SECRET) {
                console.log("🔒 refreshToken חסר או TOKEN_SECRET לא הוגדר");
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
    
                    console.log("👤 משתמש שנמצא:", user); // הוסף לוג כאן
                    console.log("currentToken לצורך השוואה:", refreshToken); // הוסף לוג כאן
                    console.log("refreshToken של המשתמש:", user.refreshToken); // הוסף לוג כאן
    
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
    

    const logout = async (req: Request, res: Response) => {
        try {
            await verifyRefreshToken(req.body.refreshToken);
            res.status(200).send('success');
        } catch (err) {
            res.status(400).send('fail');
        }
    };


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
            //send new token
        } catch (err) {
            res.status(400).send({ error: 'Refresh failed - exception' });
        }
    };

type Payload = {
    _id: string;
};

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
      return; // הפונקציה תחזור בלי להחזיר את ה-Response עצמו
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
  
      req.user = _id; // הגדרת user בתוך ה-req
      next(); // ממשיכים למידלוור או ראוט הבא
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