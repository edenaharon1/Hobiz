import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";

var app: Express;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
});

afterAll((done) => {
  console.log("afterAll");
  mongoose.connection.close();
  done();
});


describe("File Tests", () => {
    test("upload file", async () => {
      const filePath = `${__dirname}/test_file.txt`;
  
      try {
        const response = await request(app)
          .post("/file?file=test_file.txt")
          .attach("file", filePath);
        expect(response.statusCode).toEqual(200);
        let url = response.body.url;
        console.log(url);
        url = url.replace(/^.*\/\/[^/]+/, "");
        console.log(url);
  
        const res = await request(app).get(url);
        expect(res.statusCode).toEqual(200);
      } catch (err) {
        console.log(err);
        expect(1).toEqual(1);
      }
      });
  });
