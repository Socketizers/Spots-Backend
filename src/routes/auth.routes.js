"use strict";
const express = require("express");
const authRoutes = express.Router();
const basic = require("../middleware/auth/basic");
const bearer = require("../middleware/auth/bearer");

const { users } = require("../models/index");

authRoutes.post("/sign-up", async (req, res) => {
  try {
    let userRecord = await users.create(req.body);
    const output = {
      user: userRecord,
      token: userRecord.token,
    };
    res.status(201).json(output);
  } catch (e) {
    res.status(500).json(e);
  }
});

authRoutes.post("/sign-in", basic, async (req, res) => {
  try {
    const user = {
      user: req.user,
      token: req.user.token,
    };
    res.status(200).json(user);
  } catch (e) {
    res.status(500).json(e);
  }
});

authRoutes.get("/users", bearer, async (req, res, next) => {
  const userRecords = await users.findAll({});
  const list = userRecords.map((user) => user.username);
  res.status(200).json(list);
});
module.exports = authRoutes;
