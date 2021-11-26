const express = require("express");
const serverRouts = express.Router();
const Collection = require("../models/Collection");
const { servers, users } = require("../models/index");

const serversCollection = new Collection(servers);
const bearer = require("../middleware/auth/bearer");

// * V1

serverRouts
  .route("/server/:id?")
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
      const deleteServer = await serversCollection.delete(req.params.id);
      res.status(200).send(deleteServer);
    } catch (error) {
      res.status(500).send(error);
    }
  });

// Create New Server
serverRouts.post("/user/server", bearer, async (req, res) => {
  try {
    const serverInfo = req.body;
    serverInfo.user_id = req.user.id;
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
        !record.users ? (usersList = [userId]) : usersList.push(userId);
        record.update({ users: null });
        record.update({ users: usersList });
        res.status(201).json(record);
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

    servers.findOne({ where: { id: serverId } }).then((record) => {
      let usersList = record.users;
      console.log(usersList);
      let usersArr = [];
      if (!record.users) {
        res
          .status(200)
          .json({ message: "There are no users connected to this server" });
      } else {
        usersList.forEach((userId) => {
          users.findOne({ where: { id: userId } }).then((user) => {
            usersArr.push(user.dataValues);
            console.log(usersArr);
          });
        });
        setTimeout(() => {
          res.status(201).send(usersArr);
        }, 500);

        
      }
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = serverRouts;
