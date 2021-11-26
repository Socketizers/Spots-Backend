"use strict";

const express = require("express");
const roomRoutes = express.Router();

const Collection = require("../models/Collection");

const { rooms, servers } = require("../models/index");
const bearer = require("../middleware/auth/bearer");

const roomsCollection = new Collection(rooms);

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
      let id = req.params.id;
      let updateRoomInfo = req.body;
      let updatedRoom = await roomsCollection.update(id, updateRoomInfo);
      res.status(200).json(updatedRoom);
    } catch (error) {
      res.status(500).send(error);
    }
  })
  .delete(async (req, res) => {
    try {
      let id = req.params.id;
      let deletedRoom = await roomsCollection.delete(id);
      res.status(204).json(deletedRoom);
    } catch (error) {
      res.status(500).send(error);
    }
  });

// Create new room for the server
roomRoutes.post("/room", async (req, res) => {
  try {
    let roomInfo = req.body;
    console.log(roomInfo);
    let room = await roomsCollection.create(roomInfo);
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

// Get Server Rooms
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







module.exports = roomRoutes;
