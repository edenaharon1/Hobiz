import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import userModel, { IUser } from '../models/user_model';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL: '/auth/google/callback',
        },
        async (accessToken: string, refreshToken: string, profile: Profile, done: (err: any, user?: IUser | false) => void) => {
            try {
                let user = await userModel.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                } else {
                    user = new userModel({
                        googleId: profile.id,
                        username: profile.displayName,
                    });
                    await user.save();
                    return done(null, user);
                }
            } catch (err) {
                return done(err);
            }
        }
    )
);

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await userModel.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

export default passport;