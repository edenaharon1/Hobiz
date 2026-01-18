import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import userModel from "../models/user_model";
import postModel from "../models/post_model";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

var app: Express;

beforeAll(async () => {
    app = await initApp();
    // ודא שהחיבור למסד הנתונים מוגדר ב-initApp
});

afterAll(async () => {
    await mongoose.disconnect();
});

beforeEach(async () => {
    await userModel.deleteMany();
    await postModel.deleteMany();
});

describe("User Controller Tests", () => {
    let testUser: any;
    let testPost: any;
    let accessToken: string;

    beforeEach(async () => {
        testUser = await userModel.create({
            email: "test@user.com",
            password: await bcrypt.hash("testpassword", 10),
            username: "testuser",
        });

        testPost = await postModel.create({
            title: "Test Post",
            content: "Test Content",
            owner: testUser._id,
        });

        accessToken = jwt.sign({ _id: testUser._id }, process.env.TOKEN_SECRET || "secret", { expiresIn: '1h' });
    });

    test("getUserProfile", async () => {
        const response = await request(app)
            .get(`/users/${testUser._id}`) // חשוב: נתיב תקין לפי הקוד שלך הוא '/users/:id'
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.user.email).toBe(testUser.email);
        expect(response.body.posts.length).toBe(1);
    });

    test("updateUserProfile", async () => {
        const updatedUsername = "updateduser";
        const updatedImage = "updatedimage.jpg";

        const response = await request(app)
            .put(`/users/${testUser._id}`) // נתיב תקין
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                username: updatedUsername,
                image: updatedImage,
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.username).toBe(updatedUsername);
        expect(response.body.image).toBe(updatedImage);

        const updatedUser = await userModel.findById(testUser._id);
        expect(updatedUser?.username).toBe(updatedUsername);
        expect(updatedUser?.image).toBe(updatedImage);
    });

    test("getUserPosts", async () => {
        const response = await request(app)
            .get(`/users/${testUser._id}/posts`) // נתיב נכון לפי הקוד שלך
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].title).toBe(testPost.title);
    });

    test("getUserProfile - User not found", async () => {
        const nonExistentUserId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .get(`/users/${nonExistentUserId}`) // נתיב תקין
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(404);
        expect(response.text).toBe("User not found");
    });

    test("updateUserProfile - User not found", async () => {
        const nonExistentUserId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .put(`/users/${nonExistentUserId}`) // נתיב תקין
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ username: "updateduser" });

        expect(response.statusCode).toBe(404);
        expect(response.text).toBe("User not found");
    });

    test("getUserPosts - Posts not found for user", async () => {
        const anotherUser = await userModel.create({
            email: "another@user.com",
            password: await bcrypt.hash("password", 10),
            username: "anotheruser",
        });
        const anotherAccessToken = jwt.sign({ _id: anotherUser._id }, process.env.TOKEN_SECRET || "secret", { expiresIn: '1h' });

        const response = await request(app)
            .get(`/users/${anotherUser._id}/posts`) // נתיב תקין לפי הקוד שלך
            .set("Authorization", `Bearer ${anotherAccessToken}`);

        expect(response.statusCode).toBe(404);
        expect(response.text).toBe("Posts not found for this user");
    });
});
