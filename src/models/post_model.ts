import mongoose from "mongoose";

export interface IPost {
    title: string;
    content: string;
    owner: string;
    image?: string;
    likesCount: number;
    likedBy: string[];
}

const postSchema = new mongoose.Schema<IPost>({
    title: {
        type: String,
        required: true,
    },
    content: String,
    owner: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: "",
    },
    likesCount: { // הוספת likesCount לסכימה
        type: Number,
        default: 0,
    },
    likedBy: { // הוספת likedBy לסכימה
        type: [String],
        default: [],
    },
});

const postModel = mongoose.model<IPost>("Posts", postSchema);

export default postModel;