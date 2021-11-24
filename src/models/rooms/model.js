"use strict";

//------------------------------------------------
// Model Schema
//------------------------------------------------

const roomModel = (sequelize, DataTypes) => {
  return sequelize.define("Rooms", {
    name: {
      type: DataTypes.STRING,
      required: true,
      unique: true,
      allowNull: false,
    },
    server_id: { type: DataTypes.INTEGER, required: true },
    users: { type: DataTypes.ARRAY(DataTypes.STRING) },
    type: {
      type: DataTypes.ENUM("text", "voice", "podcast"),
      required: true,
      defaultValue: "text",
    },
    capacity: { type: DataTypes.INTEGER, defaultValue: 25 },
    message_history: { type: DataTypes.ARRAY(DataTypes.STRING) },
  });
};

module.exports = roomModel;
