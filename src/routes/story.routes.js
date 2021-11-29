const express = require("express");
const storyRouter = express.Router();
const { users } = require("../models/index");
const Collection = require("../models/Collection");
const userCol = new Collection(users);
const bearer = require("../middleware/auth/bearer");

storyRouter
  .route("/:id?")
  .get(bearer, async (req, res) => {
    try {
      const user = await userCol.get(req.user.id);
      res.status(200).json(user.story);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
  .put(bearer, async (req, res) => {
    try {
      let myStory = await userCol.get(req.user.id);
      console.log("myStory");
      myStory = myStory.story || {};
      myStory[req.params.id] = req.body[req.params.id];
      // console.log("myStory", myStory);

      await userCol.update(req.user.id, {
        story: myStory,
      });
      storyTimeOut(req.user.id, req.params.id);
      res.status(201).json(myStory);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  })
  .delete(bearer, async (req, res) => {
    try {
      let myStory = await userCol.get(req.user.id);
      myStory = myStory.story;
      delete myStory[req.params.id];
      await userCol.update(req.user.id, { story: myStory });
      res.status(200).json(myStory);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, errorMessage: error.message });
    }
  });
module.exports = storyRouter;
function storyTimeOut(userId, storyId) {
  setTimeout(async () => {
    try {
      let myStory = await userCol.get(userId);
      myStory = myStory.story;
      delete myStory[storyId];
      await userCol.update(userId, { story: myStory });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, errorMessage: error.message });
    }
  }, 1000 * 60 * 60 * 24);
}
