"use strict";

//------------------------------------------------
// Model Schema
//------------------------------------------------

<<<<<<< HEAD
const privateRoomModel = (sequelize, DataTypes) => 
  sequelize.define("Private-Rooms", {
=======
const privateRoomModel = (sequelize, DataTypes) => {
  return sequelize.define("Private-Rooms", {
>>>>>>> routesInit
    name: { type: DataTypes.STRING, required: true, unique: true },
    user1_id: { type: DataTypes.INTEGER, required: true },
    user2_id: { type: DataTypes.INTEGER, required: true },
    queues: { type: DataTypes.ARRAY(DataTypes.STRING) },
    message_history: { type: DataTypes.ARRAY(DataTypes.STRING) },
  });


module.exports = privateRoomModel;
