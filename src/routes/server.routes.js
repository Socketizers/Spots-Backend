const express = require("express");
const serverRouts = express.Router();
// const bearer = require("../middleware/auth/bearer");
// * V1

serverRouts
  .route("/:id?")
  .get(async (req, res) => {
    try {
      //   const servers = await get(req.params.id);
      res.status(200).send("Hello World " + req.params.id);
    } catch (error) {
      res.status(500).send(error);
    }
  })
  .put(async (req, res) => {
    const serverInfoUpdated = req.body;
    try {
      //   const servers = await update(req.params.id, serverInfoUpdated);
      res.status(200).send(serverInfoUpdated);
    } catch (error) {
      res.status(500).send(error);
    }
  })
  .delete(async (req, res) => {
    try {
      //   const servers = await remove(req.params.id);
      res.status(204).send(req.params.id);
    } catch (error) {
      res.status(500).send(error);
    }
  });

serverRouts.post("/", async (req, res) => {
  try {
    const serverInfo = req.body;
    // * const servers = await models create(serverInfo);
    res.status(201).json(serverInfo);
  } catch (error) {
    res.status(500).send(error);
  }
});

// TODO: V2
/*
serverRouts.get("/:id?", bearer, (req, res) => {
  res.send("Hello World" + req.params.id);
});
*/
module.exports = serverRouts;
