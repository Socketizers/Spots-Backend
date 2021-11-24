"use strict";
const express = require("express");
const authRoutes = express.Router();
// const basic = require("../middleware/auth/basic");
authRoutes.post("/sign-up", (req, res) => {
  res.send("Sign Up");
  try {
    //  const servers = await models create(req.body);
    res.status(201).json(req.body);
  } catch (e) {
    res.status(500).json(e);
  }
});
authRoutes.post("/sign-in", (req, res) => {
  res.send("sign-in");
  try {
    //  const servers = await models create(req.body);
    res.status(201).json(req.body);
  } catch (e) {
    res.status(500).json(e);
  }
});
/*
authRoutes.post("/sign-in", basic, (req, res) => {
  res.send("Sign Up");
  try {
    //  const servers = await models create(req.body);
    res.status(201).json(req.body);
  } catch (e) {
    res.status(500).json(e);
  }
});*/
module.exports = authRoutes;
