import mongoose from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  image?: string; // הוספת שדה image
  refreshToken?: string[];
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: { // הוספת שדה image
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