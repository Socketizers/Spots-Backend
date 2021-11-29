"use strict";

const express = require("express");
const privateRoomRoutes = express.Router();

const Collection = require("../models/Collection");

const { privateRooms, users } = require("../models/index");

const bearer = require("../middleware/auth/bearer");
const { Op } = require("sequelize");

const privateRoomsCollection = new Collection(privateRooms);

privateRoomRoutes
  .route("/private-room/:id?")
  .get(async (req, res) => {
    try {
      let allPrivateRooms = await privateRoomsCollection.get();
      res.status(200).json(allPrivateRooms);
    } catch (error) {
      res.status(500).send(error);
    }
  })
  .put(async (req, res) => {
    try {
      let id = req.params.id;
      let updatePrivateRoomInfo = req.body;
      let updatedPrivateRoom = await privateRoomsCollection.update(
        id,
        updatePrivateRoomInfo
      );
      res.status(200).json(updatedPrivateRoom);
    } catch (error) {
      res.status(500).send(error);
    }
  })
  .delete(async (req, res) => {
    try {
      let id = req.params.id;
      let deletedPrivateRoom = await privateRoomsCollection.delete(id);
      res.status(204).json(deletedPrivateRoom);
    } catch (error) {
      res.status(500).send(error);
    }
  });

//Create private room for two users
privateRoomRoutes.post("/private-room/:id", bearer, async (req, res) => {
  try {
    const privateRoomInfo = req.body;
    const privateRoom = await privateRoomsCollection.create(privateRoomInfo);
    res.status(201).json(privateRoom);
  } catch (error) {
    res.status(500).send(error);
  }
});

// get private rooms for the user
privateRoomRoutes.get("/user/private-room/:id", bearer, async (req, res) => {
  try {
    const userId = req.params.id;

    const userPrivateRooms = await Promise.all([
      privateRooms.findAll({ where: { user1_id: userId } }),
      privateRooms.findAll({ where: { user2_id: userId } }),
    ]);

    res.status(200).json(userPrivateRooms);
  } catch (error) {
    res.status(500).send(error);
  }
});

// get private rooms for two users (for private chat)

privateRoomRoutes.get("/private-room/users/:id", bearer, async (req, res) => {
  try {
    const userPrivateRooms = await privateRooms.findOne({
      where: {
        [Op.or]: [
          { room_id: req.params.id + req.user.id },
          { room_id: req.user.id + req.params.id },
        ],
      },
    });

    res.status(200).json(userPrivateRooms);
  } catch (error) {
    res.status(500).send(error);
  }
});

privateRoomRoutes.put("/message/private-room/:id", bearer, async (req, res) => {
  const privateRoom = await privateRooms.findOne({
    where: { id: req.params.id },
  });

  let messageHistory = privateRoom.message_history;
  messageHistory.push(req.body.message);

  await privateRoom.update({ message_history: null });
  await privateRoom.update({ message_history: messageHistory });
});

module.exports = privateRoomRoutes;
