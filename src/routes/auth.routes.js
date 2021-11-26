"use strict";
const express = require("express");
const authRoutes = express.Router();
const basic = require("../middleware/auth/basic");
const bearer = require("../middleware/auth/bearer");
const permissions = require('../middleware/auth/acl');
const Collection =require('../models/Collection')

const { users } = require("../models/index");

const usersCollection = new Collection(users);

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


authRoutes.delete("/user/:id",bearer,permissions('delete'), async (req, res) => {
  try {
    const deleteUser = await usersCollection.delete(req.params.id);
    res.sendStatus(200).send(deleteUser);
  } catch (error) {
    res.status(500).send(error);
  }
});


module.exports = authRoutes;
