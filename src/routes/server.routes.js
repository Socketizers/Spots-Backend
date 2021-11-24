const express = require("express");
const serverRouts = express.Router();
const Collection = require("../models/Collection");
const { servers } = require("../models/index");

const serversCollection = new Collection(servers);
const bearer = require("../middleware/auth/bearer");

// * V1

serverRouts
  .route("/:id?")
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

serverRouts.post("/", bearer, async (req, res) => {
  try {
    const serverInfo = req.body;
    const newServer = await serversCollection.create(serverInfo);
    res.status(201).json(newServer);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = serverRouts;
