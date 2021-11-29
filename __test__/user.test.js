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
describe("test user routes and auth methods", () => {
  it("can create user", async () => {
    const user = await mockRequest.post("/sign-up").send({
      username: "ahmad ibrahim",
      fullName: "Ahmad Jallad",
      email: "aa@sopts.net",
      password: "1234",
      role: "admin",
    });
    expect(user.status).toBe(201);
  });

  it("User Sign IN", async () => {
    const response = await mockRequest.post("/sign-in").auth("ahmad", "1234");

    expect(response.status).toBe(200);
  });

  it("can get all users", async () => {
    const response = await mockRequest
      .get("/users")
      .set("Authorization", `Bearer ` + myToken);
    expect(response.status).toBe(200);
  });

  it("Delete User", async () => {
    const response = await mockRequest
      .delete("/user/1")
      .set("Authorization", `Bearer ` + myToken);
    expect(response.status).toBe(204);
  });
});
4;
