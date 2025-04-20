import mongoose from "mongoose";

export interface IUser {
    username?: string; // סימן שאלה (?) מציין שזה אופציונלי ב-TypeScript
    email: string;
    password: string;
    image?: string;
    refreshToken?: string[];
}

const userSchema = new mongoose.Schema<IUser>({
    username: {
        type: String,
        unique: false, // שמור על הייחודיות כ-false אם זה מה שאתה רוצה
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: null,
    },
    refreshToken: {
        type: [String],
        default: [],
    }
});

const userModel = mongoose.model<IUser>("Users", userSchema);

export default userModel;