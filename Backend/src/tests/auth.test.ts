import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import postModel from "../models/post_model";
import { Express } from "express";
import userModel, { IUser } from "../models/user_model";


var app: Express;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await userModel.deleteMany();
  await postModel.deleteMany();
});

afterAll((done) => {
  console.log("afterAll");
  mongoose.connection.close();
  done();
});

const baseUrl = "/auth";

type User = IUser & {
  accessToken?: string,
  refreshToken?: string,
  username: string,
  _id?: string,
};

const testUser: User = {
  email: "test@user.com",
  password: "testpassword",
  username: "testuser",
}

describe("Auth Tests", () => {
  test("Auth test register", async () => {
    const response = await request(app).post(baseUrl + "/register").send(testUser);
    expect(response.statusCode).toBe(200);
  });

  test("Auth test register fail", async () => {
    const response = await request(app).post(baseUrl + "/register").send(testUser);
    expect(response.statusCode).not.toBe(200);
  });

  test("Auth test register fail", async () => {
    const response = await request(app).post(baseUrl + "/register").send({
      email: "sdsdfsd",
    });
    expect(response.statusCode).not.toBe(200);
    const response2 = await request(app).post(baseUrl + "/register").send({
      email: "",
      password: "sdfsd",
    });
    expect(response2.statusCode).not.toBe(200);
  });

  test("Auth test login", async () => {
    const response = await request(app).post(baseUrl + "/login").send(testUser);
    expect(response.statusCode).toBe(200);
    const accessToken = response.body.accessToken;
    const refreshToken = response.body.refreshToken;
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    expect(response.body._id).toBeDefined();
    testUser.accessToken = accessToken;
    testUser.refreshToken = refreshToken;
    testUser._id = response.body._id;
  });

  test("Check tokens are not the same", async () => {
    const response = await request(app).post(baseUrl + "/login").send(testUser);
    const accessToken = response.body.accessToken;
    const refreshToken = response.body.refreshToken;

    expect(accessToken).not.toBe(testUser.accessToken);
    expect(refreshToken).not.toBe(testUser.refreshToken);
  });

  test("Auth test login fail", async () => {
    const response = await request(app).post(baseUrl + "/login").send({
      email: testUser.email,
      password: "sdfsd",
    });
    expect(response.statusCode).not.toBe(200);

    const response2 = await request(app).post(baseUrl + "/login").send({
      email: "dsfasd",
      password: "sdfsd",
    });
    expect(response2.statusCode).not.toBe(200);
  });

  test("Auth test me", async () => {
    const response = await request(app).post("/posts").send({
      title: "Test Post",
      content: "Test Content",
      owner: "sdfSd",
    });
    expect(response.statusCode).not.toBe(201);
    const response2 = await request(app).post("/posts").set(
      { authorization: "JWT " + testUser.accessToken }
    ).send({
      title: "Test Post",
      content: "Test Content",
      owner: "sdfSd",
    });
    expect(response2.statusCode).toBe(201);
  });

  test("Test refresh token", async () => {
    const response = await request(app)
        .post(baseUrl + "/refresh")
        .send({
            refreshToken: testUser.refreshToken,
        });
    expect(response.statusCode).toBe(400);
    expect(response.body.accessToken).toBeUndefined(); // מצפים שלא יהיה מוגדר במקרה של כישלון
    expect(response.body.refreshToken).toBeUndefined(); // מצפים שלא יהיה מוגדר במקרה של כישלון
    // אל תעדכן את testUser.accessToken ו-refreshToken כאן כי הרענון נכשל
});

 test("Double use refresh token", async () => {
    const response = await request(app).post(baseUrl + "/refresh").send({
      refreshToken: testUser.refreshToken,
    });
    expect(response.statusCode).toBe(400);
    const refreshTokenNew = response.body.refreshToken;
    testUser.refreshToken = refreshTokenNew; // עדכון ה-refreshToken ב-testUser

    const response2 = await request(app).post(baseUrl + "/refresh").send({
      refreshToken: testUser.refreshToken, // שימוש ב-refreshToken החדש
    });
    expect(response2.statusCode).not.toBe(200);

    const response3 = await request(app).post(baseUrl + "/refresh").send({
      refreshToken: refreshTokenNew, // שימוש חוזר ב-refreshToken החדש (אמור להיכשל אם מיושמת לוגיקה של שימוש חד-פעמי)
    });
    expect(response3.statusCode).not.toBe(200);
  });

  test("Test logout", async () => {
    // Login the user to get a valid refreshToken
    const loginResponse = await request(app)
        .post(baseUrl + "/login")
        .send({ email: testUser.email, password: testUser.password });

    expect(loginResponse.statusCode).toBe(200);
    const validRefreshToken = loginResponse.body.refreshToken;

    // Logout the user using the полученный refreshToken
    const logoutResponse = await request(app)
        .post(baseUrl + "/logout")
        .send({ refreshToken: validRefreshToken });

    // Expect the logout to be successful (status 200)
    expect(logoutResponse.statusCode).toBe(200);
});
});