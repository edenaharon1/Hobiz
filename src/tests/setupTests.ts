import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import { expect, beforeAll, afterAll } from '@jest/globals'; // ייבוא נכון

let app: Express;
export let testUser: { token: string; _id: string  };

beforeAll(async () => {
    console.log("Global beforeAll");
    app = await initApp();

    // יצירת משתמש חדש
    await request(app)
        .post("/auth/register")  // נוודא שהנתיב הזה קיים אצלך
        .send({
            email: "test@user.com",
            password: "testpassword",
        });

    // עכשיו תעשה את ה־login
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



export { app };
