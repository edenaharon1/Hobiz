import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import userModel from "../models/user_model";
import postModel from "../models/post_model";
import jwt from "jsonwebtoken";

var app: Express;

beforeAll(async () => {
    app = await initApp();
    await userModel.deleteMany();
    await postModel.deleteMany();
});

afterAll((done) => {
    mongoose.connection.close();
    done();
});

describe("User Controller Tests", () => {
    let testUser: any;
    let testPost: any;
    let token: string;

    beforeEach(async () => {
        testUser = await userModel.create({
            email: "test@user.com",
            password: "testpassword",
            username: "testuser",
        });

        testPost = await postModel.create({
            title: "Test Post",
            content: "Test Content",
            owner: testUser._id,
        });

        token = jwt.sign({ _id: testUser._id }, process.env.TOKEN_SECRET || "secret");
    });

    afterEach(async () => {
        await userModel.deleteMany();
        await postModel.deleteMany();
    });

    test("getUserProfile", async () => {
        const response = await request(app)
            .get(`/users/${testUser._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.user.email).toBe(testUser.email);
        expect(response.body.posts.length).toBe(1);
    });

    test("updateUserProfile", async () => {
        const response = await request(app)
            .put(`/users/${testUser._id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                username: "updateduser",
                profileImage: "updatedimage.jpg",
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.username).toBe("updateduser");
        expect(response.body.profileImage).toBe("updatedimage.jpg");
    });
});