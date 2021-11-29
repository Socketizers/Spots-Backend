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

describe("SERVER ROUTES TESTING", () => {
  it("Create New Server", async () => {
    const newServer = await mockRequest
      .post("/user/server")
      .set("Authorization", `Bearer ` + myToken)
      .send({
        name: "slimy gamer",
        description: "best gaming server",
        category: "Game=ing",
        user_id: "1",
        public: true,
        rooms_num: 25,
      });
    expect(newServer.status).toBe(201);
    expect(newServer.body.name).toEqual("slimy gamer");
  });

  it("GET Server", async () => {
    const response = await mockRequest
      .get("/server")
      .set("Authorization", `Bearer ` + myToken);

    expect(response.status).toBe(200);
    // expect(newServer.body.name).toEqual("slimy gamer");
  });

  it("update Server", async () => {
    const newServer = await mockRequest
      .put("/server/1")
      .set("Authorization", `Bearer ` + myToken)
      .send({
        name: "sad gamer",
        description: "best gaming server",
        category: "Game=ing",
        user_id: "1",
        public: true,
        rooms_num: 25,
      });
    expect(newServer.status).toBe(200);
    expect(newServer.body.name).toEqual("sad gamer");
  });

  it("Delete Server", async () => {
    const response = await mockRequest
      .delete("/server/1")
      .set("Authorization", `Bearer ` + myToken);
    console.log(response.body);
    expect(response.status).toBe(204);
  });
});
