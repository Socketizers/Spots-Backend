"use strict";

//------------------------------------------------
// Model Schema
//------------------------------------------------

const privateRoomModel = (sequelize, DataTypes) => {
  return sequelize.define("Private-Rooms", {
    name: { type: DataTypes.STRING, required: true, unique: true },
    user1_id: { type: DataTypes.INTEGER, required: true },
    user2_id: { type: DataTypes.INTEGER, required: true },
    queues: { type: DataTypes.ARRAY(DataTypes.STRING) },
    message_history: { type: DataTypes.ARRAY(DataTypes.STRING) },
  });
};

module.exports = privateRoomModel;
