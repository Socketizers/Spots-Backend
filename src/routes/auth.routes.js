"use strict";
const express = require("express");
const authRoutes = express.Router();
const basic = require("../middleware/auth/basic");
const bearer = require("../middleware/auth/bearer");
const permissions = require("../middleware/auth/acl");
const Collection = require("../models/Collection");
const { users, friendRequest } = require("../models/index");
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/users");
  },
  filename: function (req, file, cb) {
    cb(null, req.body.username + "_" + file.originalname);
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
const friendRequestCollection = new Collection(friendRequest);

authRoutes.post("/sign-up", upload.single("image"), async (req, res, next) => {
  try {
    const user = {
      username: req.body.username,
      fullName: req.body.fullName,
      image: req.file.path,
      password: req.body.password,
      role: req.body.role,
      onlineStatus: true,
      email: req.body.email,
    };

    let userRecord = await users.create(user);
    const output = {
      user: userRecord,
      token: userRecord.token,
    };
    res.status(201).json(output);
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  }
});

authRoutes.post("/sign-in", basic, async (req, res) => {
  try {
    const user = {
      user: req.user,
      token: req.user.token,
    };

    users.findOne({ where: { id: user.user.id } }).then((user) => {
      user.update({
        onlineStatus: true,
      });
    });
    res.status(200).json(user);
  } catch (e) {
    res.status(500).json(e);
  }
});

authRoutes.get("/users", bearer, async (req, res, next) => {
  const userRecords = await users.findAll({});
  const list = userRecords.map((user) => user);
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

////// Friend requests

authRoutes.post("/friends", async (req, res) => {
  const request = {
    user1_id: req.body.user1_id,
    user2_id: req.body.user2_id,
  };
  const sendRequest = await friendRequestCollection.create(request);

  res.status(201).json(sendRequest);
});

authRoutes.get("/friends/:id", async (req, res) => {
  const friendRequests = await friendRequest.findAll({
    where: { user1_id: req.params.id },
  });
  res.status(200).json(friendRequests);
});

authRoutes.put("/friends/:id", async (req, res) => {
  const updatedRequest = await friendRequestCollection.update(req.params.id, {
    pending: false,
    response: req.body.response,
  });

  if (updatedRequest.response === "yes") {
    /// updating user1 friend list
    const user = await usersCollection.get(updatedRequest.user1_id);

    let userFriends = user.friends || [];

    userFriends.push(updatedRequest.user2_id);

    await user.update({ friends: userFriends });

    /// updating user2 friend list

    const user2 = await usersCollection.get(updatedRequest.user2_id);

    let user2Friends = user2.friends || [];

    user2Friends.push(updatedRequest.user1_id);

    await user2.update({ friends: user2Friends });
  }
  res.status(200).json(updatedRequest);
});

authRoutes.delete("/friends/:id", async (req, res) => {
  const deletedRequest = await friendRequestCollection.delete(req.params.id);
  res.status(204).json(deletedRequest);
});

module.exports = authRoutes;
