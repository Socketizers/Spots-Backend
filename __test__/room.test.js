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
          mockRequest
            .post("/user/server")
            .set("Authorization", `Bearer ` + myToken)
            .send({
              name: "slimy gamer",
              description: "best gaming server",
              category: "Game=ing",
              user_id: "1",
              public: true,
              rooms_num: 25,
            })
            .then(() => {
              done();
            });
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

describe("ROOM ROUTES TESTING", () => {
  it("create a new room", async () => {
    const res = await mockRequest
      .post("/room")
      .set("Authorization", `Bearer ` + myToken)
      .send({
        server_id: 1,
        type: "text",
        presenter: 1,
        capacity: 25,
      });
    expect(res.status).toBe(201);
  });

  it("Get rooms", async () => {
    const res = await mockRequest
      .get("/room")
      .set("Authorization", `Bearer ` + myToken);
    expect(res.status).toBe(200);
  });

  it("update room", async () => {
    const res = await mockRequest
      .put("/room/1")
      .set("Authorization", `Bearer ` + myToken)
      .send({
        server_id: 1,
        type: "text",
        presenter: 1,
        capacity: 300,
      });
    expect(res.status).toBe(200);
    expect(res.body.capacity).toBe(300);
  });

  it("delete room", async () => {
    const res = await mockRequest
      .delete("/room/1")
      .set("Authorization", `Bearer ` + myToken);
    expect(res.status).toBe(204);
  });
});
