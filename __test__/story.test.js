"use strict";

const { server } = require("../src/server");
const supertest = require("supertest");

const mockRequest = supertest(server);

const { db } = require("../src/models/index");

let myToken;
beforeAll((done) => {
  db.sync()
    .then(() => {
      mockRequest
        .post("/sign-up")
        .send({
          username: "ahmad",
          fullName: "Ahmad Jallad",
          email: "aa@sopts.net",
          password: "1234",
          role: "admin",
        })
        .then((res) => {
          myToken = res.body.token;
          done();
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

afterAll((done) => {
  db.drop()
    .then(() => {
      done();
    })
    .catch((err) => {
      console.log(err);
    });
});

describe("", () => {
  it("add a story", async () => {
    const res = await mockRequest
      .put("/story/11-29:2:51")
      .set("Authorization", `Bearer ` + myToken)
      .send({
        "11-29:2:51": "my story",
      });
    expect(res.status).toBe(201);
  });

  it("get a story", async () => {
    const res = await mockRequest
      .get("/story")
      .set("Authorization", `Bearer ` + myToken);

    expect(res.status).toBe(200);
  });
  it("Delete Story", async () => {
    const res = await mockRequest
      .delete("/story/11-29:2:51")
      .set("Authorization", `Bearer ` + myToken);
    expect(res.status).toBe(200);
  });
});
