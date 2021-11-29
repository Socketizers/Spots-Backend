"use strict";

//------------------------------------------------
// Model Schema
//------------------------------------------------

const roomModel = (sequelize, DataTypes) =>
  sequelize.define("Rooms", {
    server_id: {
      type: DataTypes.INTEGER,
      required: true,
    },
    // users: {
    //   type: DataTypes.ARRAY(DataTypes.INTEGER),
    // },
    // message_history: {
    //   type: DataTypes.ARRAY(DataTypes.STRING),
    // },
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
  });

module.exports = roomModel;
