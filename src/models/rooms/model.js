"use strict";

//------------------------------------------------
// Model Schema
//------------------------------------------------

const roomModel = (sequelize, DataTypes) =>
  sequelize.define("Rooms", {
    name: {
      type: DataTypes.STRING,
      require: true,
    },
    server_id: {
      type: DataTypes.INTEGER,
      required: true,
    },
    users: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
    },
    type: {
      type: DataTypes.ENUM("text", "voice", "podcast"),
      required: true,
      defaultValue: "text",
    },
    presenter: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
    capacity: {
      type: DataTypes.INTEGER,
      defaultValue: 25,
    },
    message_history: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
  });

module.exports = roomModel;
