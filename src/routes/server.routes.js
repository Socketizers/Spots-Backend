const express = require("express");
const serverRouts = express.Router();
const Collection = require("../models/Collection");
const { servers, users } = require("../models/index");

const serversCollection = new Collection(servers);
const bearer = require("../middleware/auth/bearer");
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/servers");
  },
  filename: function (req, file, cb) {
    cb(null, req.body.name + "_" + file.originalname);
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

// * V1

serverRouts
  .route("/server/:id")
  .get(bearer, async (req, res) => {
    try {
      const allServers = await serversCollection.get(req.params.id);
      res.status(200).send(allServers);
    } catch (error) {
      res.status(500).send(error);
    }
  })
  .put(bearer, async (req, res) => {
    const serverInfoUpdated = req.body;
    try {
      const updatedServer = await serversCollection.update(
        req.params.id,
        serverInfoUpdated
      );
      res.status(200).send(updatedServer);
    } catch (error) {
      res.status(500).send(error);
    }
  })
  .delete(bearer, async (req, res) => {
    try {
      const server = await serversCollection.get(req.params.id);
      console.log(server);
      const path = server.dataValues.image;
      fs.unlink(path, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
      const deleteServer = await serversCollection.delete(req.params.id);
      res.sendStatus(200).send(deleteServer);
    } catch (error) {
      res.status(500).send(error);
    }
  });

// Create New Server
serverRouts.post("/user/server", bearer,upload.single("image"), async (req, res) => {
  try {
    const serverInfo = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      image: req.file.path,
      user_id: req.user.id,
      public: true,
    };

    const newServer = await serversCollection.create(serverInfo);
    res.status(201).json(newServer);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// Get User Servers
serverRouts.get("/user/servers", bearer, async (req, res) => {
  try {
    const UserServers = await servers.findAll({
      where: { user_id: req.user.id },
    });
    res.status(201).json(UserServers);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

//Get Server based on their cateogory
serverRouts.get("/servers", bearer, async (req, res) => {
  try {
    const UserServers = await servers.findAll({
      where: { category: req.query.type },
    });
    res.status(201).json(UserServers);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// Join a server
serverRouts.put("/connect/server/:id", bearer, async (req, res) => {
  try {
    let userId = req.user.id;
    let serverId = req.params.id;

    // updating server users list 
    servers.findOne({ where: { id: serverId } }).then((record) => {
      let usersList = record.users;
      if (!record.users) {
        usersList = [userId];
        record.update({ users: usersList });
        res.status(201).json(record);
      } else if (usersList.includes(userId)) {
        res
          .status(201)
          .json({ message: "User is already connected to the server" });
      } else {
        usersList.push(userId);
        record.update({ users: null });
        record.update({ users: usersList });
        res.status(201).json(record);
      }
    });

    // Updating user subscirbed list
    users.findOne({ where: { id: userId } }).then((record) => {
      console.log(record.subscribed);
      let subscribedList = record.subscribed;
      if (!record.subscribed) {
        subscribedList = [serverId];
        record.update({ subscribed: subscribedList });
  
      } else if (subscribedList.includes(serverId)) {
        res
          .status(201)
          .json({ message: "User is already subscribed to the server" });
      } else {
        subscribedList.push(serverId);
        record.update({ subscribed: null });
        record.update({ subscribed: subscribedList });
    
      }
    });





  } catch (error) {
    res.status(500).send(error);
  }
});

// Leave  server
serverRouts.put("/disconnect/server/:id", bearer, async (req, res) => {
  try {
    let userId = req.user.id;
    let serverId = req.params.id;

    servers.findOne({ where: { id: serverId } }).then((record) => {
      let usersList = record.users;
      if (!record.users || !usersList.includes(userId)) {
        res
          .status(201)
          .json({ message: "User is not connected to this server" });
      } else {
        let userIndex = usersList.indexOf(userId);
        usersList.splice(userIndex, 1);
        record.update({ users: null });
        record.update({ users: usersList });
        res.status(201).json(record);
      }
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

//Get the users connected to the server
serverRouts.get("/connected/server/:id", bearer, async (req, res) => {
  try {
    let serverId = req.params.id;

    const record = await servers.findOne({ where: { id: serverId } });
    const usersList = record.users;

    if (!record.users) {
      res
        .status(200)
        .json({ message: "There are no users connected to this server" });
    } else {
      let usersArr = await Promise.all(
        usersList.map(async (userId) => {
          let user = await users.findOne({ where: { id: userId } });
          return {
            username: user.dataValues.username,
            fullName: user.dataValues.fullName,
            image: user.dataValues.image,
          };
        })
      );

      res.status(201).send(usersArr);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = serverRouts;
