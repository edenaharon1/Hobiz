import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import { expect, beforeAll, afterAll } from '@jest/globals'; // ייבוא נכון

let app: Express;
export let testUser: { token: string; _id: string };

beforeAll(async () => {
    console.log("Global beforeAll");
    app = await initApp();

    const loginResponse = await request(app)
        .post("/auth/login")
        .send({
            email: "test@user.com",
            password: "testpassword",
        });

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.accessToken).toBeDefined();

    testUser = {
        token: loginResponse.body.accessToken,
        _id: loginResponse.body._id,
    };

    console.log("testUser:", testUser);
});

afterAll(async () => {
    console.log("Global afterAll");
    await mongoose.connection.close();
});

export { app };