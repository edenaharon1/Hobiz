import mongoose, { Schema } from "mongoose";

export interface iComment {
    comment: string;
    postId: Schema.Types.ObjectId;
    owner: Schema.Types.ObjectId;
}

const commentsSchema = new mongoose.Schema<iComment>({
    comment: {
        type: String,
        required: true,
    },
    postId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
    },
});

const commentsModel = mongoose.model<iComment>("comments", commentsSchema);

export default commentsModel;