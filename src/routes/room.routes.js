"use strict";

const express = require("express");
const roomRoutes = express.Router();

const Collection = require("../models/Collection");

const { rooms, servers, users } = require("../models/index");
const bearer = require("../middleware/auth/bearer");

const roomsCollection = new Collection(rooms);

// ********************************** Get, Put, and Delete requests for rooms table *****************

roomRoutes
  .route("/room/:id?")
  .get(async (req, res) => {
    try {
      let allRooms = await roomsCollection.get();
      res.status(200).json(allRooms);
    } catch (error) {
      res.status(500).send(error);
    }
  })
  .put(async (req, res) => {
    try {
      const id = req.params.id;
      const updateRoomInfo = req.body;
      const updatedRoom = await roomsCollection.update(id, updateRoomInfo);
      res.status(200).json(updatedRoom);
    } catch (error) {
      res.status(500).send(error);
    }
  })
  .delete(async (req, res) => {
    try {
      const id = req.params.id;
      const deletedRoom = await roomsCollection.delete(id);
      res.status(204).json(deletedRoom);
    } catch (error) {
      res.status(500).send(error);
    }
  });

// *********************************** Create new room for the server *****************************

roomRoutes.post("/room", async (req, res) => {
  try {
    // create room
    const roomInfo = req.body;
    // console.log(roomInfo);
    const room = await roomsCollection.create(roomInfo);

    //update server table
    servers.findOne({ where: { id: roomInfo.server_id } }).then((record) => {
      let roomNum;
      !record.rooms_num ? (roomNum = 1) : (roomNum = record.rooms_num + 1);
      record.update({ rooms_num: roomNum });
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).send(error);
  }
});


// ***************************************** Get Server Rooms ****************************************
roomRoutes.get("/rooms/server/:id", bearer, async (req, res) => {

  try {
    const ServerRooms = await rooms.findAll({
      where: { server_id: req.params.id },
    });
    res.status(201).json(ServerRooms);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// *********************************************** Join a Room ***************************************

roomRoutes.put("/connect/room/:id", bearer, async (req, res) => {
  try {
    const userId = req.user.id;
    const roomId = req.params.id;

    rooms.findOne({ where: { id: roomId } }).then((record) => {
      let usersList = record.users;
      if (!record.users) {
        usersList = [userId];
        record.update({ users: usersList });
        res.status(201).json(record);
      } else if (usersList.length >= record.capacity) {
        res.status(201).json({ message: "Room is Full" });
      } else {
        usersList.push(userId);
        record.update({ users: null });
        record.update({ users: usersList });
        res.status(201).json(record);
      }
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// ******************************************** Leave a room ***************************************

roomRoutes.put("/disconnect/room/:id", bearer, async (req, res) => {
  try {
    const userId = req.user.id;
    const roomId = req.params.id;

    servers.findOne({ where: { id: roomId } }).then((record) => {
      let usersList = record.users;
      if (!record.users || !usersList.includes(userId)) {
        res.status(201).json({ message: "User is not in this room" });
      } else {
        const userIndex = usersList.indexOf(userId);
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

// ************************************* Get the users connected to the room ***********************

roomRoutes.get("/connected/room/:id", bearer, async (req, res) => {
  try {
    const roomId = req.params.id;

    const record = await rooms.findOne({ where: { id: roomId } });
    const usersList = record.users;
    // console.log(usersList);

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

// ************************************* General room new message **************************************

roomRoutes.put("/message/room/:id", bearer, async (req, res) => {
  try {
    const roomId = req.params.id;
    const message = {
      time: new Date(),
      username: req.user.username,
      message: req.body.message,
    };

    rooms.findOne({ where: { id: roomId } }).then((record) => {
      let messagesList = record.message_history;
      if (!record.message_history) {
        messagesList = [message];
        record.update({ message_history: messagesList });
        res.status(201).json(record);
      } else {
        messagesList.push(message);
        record.update({ message_history: null });
        record.update({ message_history: messagesList });
        res.status(201).json(record);
      }
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// ******************************* Render room messages ************************

roomRoutes.get("/message/room/:id", bearer, async (req, res) => {
  try {
    const roomId = req.params.id;

    const record = await rooms.findOne({ where: { id: roomId } });
    const messagesList = record.message_history;

    if (!record.message_history) {
      res.status(200).json({ message: "Start a conversation!" });
    }
    let messagesArr = messagesList.map((message) => {
      return JSON.parse(message);
    });

    res.status(201).send(messagesArr);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = roomRoutes;
