"use strict";

const express = require("express");
const roomRoutes = express.Router();

const Collection = require("../models/Collection");

const { rooms } = require("../models/index");

const roomsCollection = new Collection(rooms);

roomRoutes
  .route("/:id?")
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

roomRoutes.post("/", async (req, res) => {
  try {
    let roomInfo = req.body;
    console.log(roomInfo);
    let room = await roomsCollection.create(roomInfo);
    res.status(201).json(room);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = roomRoutes;
