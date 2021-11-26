"use strict";
const express = require("express");
const authRoutes = express.Router();
const basic = require("../middleware/auth/basic");
const bearer = require("../middleware/auth/bearer");
const permissions = require("../middleware/auth/acl");
const Collection = require("../models/Collection");
const { users } = require("../models/index");
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/users");
  },
  filename: function (req, file, cb) {
    cb(null, req.body.username+'_'+ file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

const usersCollection = new Collection(users);

authRoutes.post("/sign-up", upload.single("image"), async (req, res, next) => {
  try {
    const user = {
      username: req.body.username,
      fullName: req.body.fullName,
      image: req.file.path,
      password: req.body.password,
      role: req.body.role,
    };

    let userRecord = await users.create(user);
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

authRoutes.delete(
  "/user/:id",
  bearer,
  permissions("delete"),
  async (req, res) => {
    try {
      const user = await usersCollection.get(req.params.id);
      console.log(user);
      const path = user.dataValues.image;

      fs.unlink(path, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
      const deleteUser = await usersCollection.delete(req.params.id);
      res.sendStatus(200).send(deleteUser);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

module.exports = authRoutes;
