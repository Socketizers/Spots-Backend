"use strict";

//------------------------------------------------
// Model Schema
//------------------------------------------------

const privateRoomModel = (sequelize, DataTypes) =>
  sequelize.define("Private-Rooms", {
    user1_id: { type: DataTypes.INTEGER, required: true },
    user2_id: { type: DataTypes.INTEGER, required: true },
    message_history: { type: DataTypes.ARRAY(DataTypes.STRING) },
  });

module.exports = privateRoomModel;
