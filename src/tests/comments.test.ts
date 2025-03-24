import request from "supertest";
import commentsModel from '../models/comments_model';
import { app, testUser } from "./setupTests";
import mongoose from "mongoose";

let commentId = "";
let postId = new mongoose.Types.ObjectId();

beforeAll(async () => {
    console.log('beforeAll comments.test.ts');
    await commentsModel.deleteMany();
});

describe("comment test suite", () => {
    test("comment test get all", async () => {
        const response = await request(app).get("/comments");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(0);
    });
});

test("Test adding new comment", async () => {
    if (!testUser || !testUser.token) {
        throw new Error("testUser.token is not defined. Make sure you logged in before this test");
    }
    const response = await request(app)
        .post("/comments")
        .set({ authorization: "JWT " + testUser.token })
        .send({
            comment: "first title",
            postId: postId.toString(), // המרה ל-string
            owner: testUser._id, // המרה ל-string
       });
       console.log("Response body:", response.body);

       expect(response.statusCode).toBe(201);
       expect(response.body.comment).toBe("first title");
       expect(response.body.postId).toBe(postId.toString());
       expect(response.body.owner).toBe(testUser._id);
       commentId = response.body._id;
   });

test("test get comment by owner", async () => {
    const response = await request(app).get("/comments?owner=" + testUser._id);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].owner).toBe(testUser._id);
});

test("test get comment by id", async () => {
    const response = await request(app).get("/comments/" + commentId);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(commentId);
});

test("test get comment by id fail", async () => {
    const response = await request(app).get("/comments/hdncj545kdgf875");
    expect(response.statusCode).toBe(400);
});