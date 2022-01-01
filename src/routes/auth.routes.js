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

// using disk storage engine gives the full control on storing files to disk.
const storage = multer.diskStorage({
  // destination is used to determine within which folder the uploaded files should be stored
  destination: function (req, file, cb) {
    cb(null, "./uploads/users");
  },
  // filename is used to determine what the file should be named inside the folder
  filename: function (req, file, cb) {
    cb(null, req.body.username + "_" + file.originalname);
  },
});

// using fileFilter function to control which files should be uploaded and which should be skipped
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    // To accept the file pass `true`
    cb(null, true);
  } else {
    // To reject the file pass `false`
    cb(null, false);
  }
};

// creating a middle ware that will check of images and upload them
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

const usersCollection = new Collection(users);
const friendRequestCollection = new Collection(friendRequest);

// ******************************************* Sign up ***************************************************

authRoutes.post("/sign-up", upload.single("image"), async (req, res, next) => {
  try {
    // check if the user didn't upload an image set the default one
    const user = req.file
      ? {
          username: req.body.username,
          fullName: req.body.fullName,
          image: req.file.path,
          password: req.body.password,
          role: req.body.role,
          onlineStatus: true,
          email: req.body.email,
        }
      : {
          username: req.body.username,
          fullName: req.body.fullName,
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

// ******************************************* Sign in ***************************************************

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

authRoutes.post("/log-in", bearer, async (req, res) => {
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


// Sign Out Route (editing online status for a user to edit last seen property)

authRoutes.post("/sign-out",bearer, async(req, res) => {
  try{
    const user = await users.findOne({where: {id: req.user.id}});

    await user.update({onlineStatus: false})
  }catch(e){
    res.status(500).json(e);
  }
})


// ******************************************* Get all users (for the admin only) ***********************

authRoutes.get(
  "/users",
  bearer,
  permissions("delete"),
  async (req, res, next) => {
    const userRecords = await users.findAll({});
    const list = userRecords.map((user) => user);
    res.status(200).json(list);
  }
);

// ******************************************* Delete user (for the admin only) ***********************


authRoutes.delete(
  "/user/:id",
  bearer,
  permissions("delete"),
  async (req, res) => {
    try {
      const user = await usersCollection.get(req.params.id);
      // console.log(user);
      const path = user.dataValues.image;

      // deleting user image from uploads folder
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


// ***************************************** User Friend List ***********************************


authRoutes.get("/user/friends", bearer, async (req, res) => {
  try {
    const record = await users.findOne({ where: { id: req.user.id } });
    const usersList = record.dataValues.friends;

    if (!usersList.length) {
      res
        .status(200)
        .json({users:[], message: "There is no friends!" });
    } else {
      let usersArr = await Promise.all(
        usersList.map(async (userId) => {
          console.log(userId);
          let user = await users.findOne({ where: { id: userId } });
          return {
            id: user.dataValues.id,
            username: user.dataValues.username,
            fullName: user.dataValues.fullName,
            image: user.dataValues.image,
            story:user.dataValues.story,
            onlineStatus:user.dataValues.onlineStatus,
          };
        })
      );

      res.status(201).send({users:usersArr, message:"Friends list returned successfully"});
    }
  } catch (error) {
    res.status(500).send(error);
  }
});





// ***************************************** Friend Requests Operations ***********************************

// ********************* Post request (will be called when user wants to add another user) ****************

authRoutes.post("/friends", bearer,async (req, res) => {
  const request = {
    user1_id: req.user.id,
    user2_id: req.body.user2_id,
  };
  const sendRequest = await friendRequestCollection.create(request);

  res.status(201).json(sendRequest);
});

// ********************* Get request (will be called to list the pending requests fo a user) ****************

authRoutes.get("/friends/sent-request", bearer, async (req, res) => {
  const friendRequests = await friendRequest.findAll({
    where: { user1_id: req.user.id },
  });
  res.status(200).json(friendRequests);
});


// ********************* Get request (will be called to list the pending requests for a user) ****************

authRoutes.get("/friends/new-request", bearer, async (req, res) => {
  const friendRequests = await friendRequest.findAll({
    where: { user2_id: req.user.id },
  });
  res.status(200).json(friendRequests);
});

// ********************* Put request (will be called when a user respond to a request from another user) ****************

authRoutes.put("/friends/:id", async (req, res) => {
  const updatedRequest = await friendRequestCollection.update(req.params.id, {
    pending: false,
    response: req.body.response,
  });

  // check the user response if it yes update the user friends information (table)

  if (updatedRequest.response === "yes") {
    /// updating user1 friend list
    const user = await usersCollection.get(updatedRequest.user1_id);

    let userFriends = user.friends || [];

    userFriends.push(updatedRequest.user2_id);

    await user.update({ friends: null });
    await user.update({ friends: userFriends });

    /// updating user2 friend list

    const user2 = await usersCollection.get(updatedRequest.user2_id);

    let user2Friends = user2.friends || [];

    user2Friends.push(updatedRequest.user1_id);
    await user2.update({ friends: null });
    await user2.update({ friends: user2Friends });
  }
  
  await friendRequestCollection.delete(req.params.id);

  res.status(200).json(updatedRequest);
});

// ********************* Delete request (to delete the request from friends table) ****************

authRoutes.delete("/friends/:id",bearer, async (req, res) => {
  const deletedRequest = await friendRequestCollection.delete(req.params.id);
  res.status(204).json(deletedRequest);
});

module.exports = authRoutes;
