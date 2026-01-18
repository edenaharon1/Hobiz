import request from "supertest";
import commentsModel from '../models/comments_model';
import { app, testUser } from "./setupTests";
import mongoose from "mongoose";

let commentId = "";
let postId = new mongoose.Types.ObjectId();
let postId2 = new mongoose.Types.ObjectId();

beforeAll(async () => {
    console.log('beforeAll comments.test.ts');
    await commentsModel.deleteMany();
    await commentsModel.insertMany([
        { comment: "Initial Comment 1 for post 1", postId: postId, owner: testUser._id },
        { comment: "Initial Comment 2 for post 1", postId: postId, owner: testUser._id },
        { comment: "Initial Comment for post 2", postId: postId2, owner: testUser._id },
    ]);
});

afterAll(async () => {
    console.log('afterAll comments.test.ts');
    
    // קודם נבצע את פעולות הניקוי
    await commentsModel.deleteMany();
    
    // ואז נסגור את החיבור למונגוDB
    await mongoose.connection.close();
  });

describe("comment test suite", () => {
    test("comment test get all", async () => {
        const response = await request(app).get("/comments");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThanOrEqual(3);
    });

    test("Test adding new comment", async () => {
        if (!testUser || !testUser.token) {
            throw new Error("testUser.token is not defined. Make sure you logged in before this test");
        }
        const response = await request(app)
            .post("/comments")
            .set({ authorization: "JWT " + testUser.token })
            .send({
                comment: "Added Comment",
                postId: postId.toString(),
                owner: testUser._id,
            });
        expect(response.statusCode).toBe(201);
        expect(response.body.comment).toBe("Added Comment");
        expect(response.body.postId).toBe(postId.toString());
        expect(response.body.owner).toBe(testUser._id);
        commentId = response.body._id;
    });

    test("test get comment by owner", async () => {
        const response = await request(app).get("/comments?owner=" + testUser._id);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThanOrEqual(4);
        expect(response.body.every((comment: any) => comment.owner === testUser._id)).toBe(true);
    });

    test("test get comment by id", async () => {
        const response = await request(app).get("/comments/" + commentId);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(commentId);
    });

    test("test get comment by id fail", async () => {
        const response = await request(app).get("/comments/invalidId");
        expect(response.statusCode).toBe(400);
    });

    test("test get comments by postId", async () => {
        const response = await request(app).get(`/comments/post/${postId}`);
        expect(response.statusCode).toBe(200);
        // הפעם אנחנו מצפים ל-3 תגובות עבור postId, כי אחת נוספה בבדיקה "Test adding new comment"
        expect(response.body).toHaveLength(3);
        expect(response.body.every((comment: any) => comment.postId === postId.toString())).toBe(true);
    });

    test("test get comments by postId - no results for other post", async () => {
        const response = await request(app).get(`/comments/post/${new mongoose.Types.ObjectId()}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(0);
    });
});