"use strict";

//------------------------------------------------
// Model Schema
//------------------------------------------------

const roomModel = (sequelize, DataTypes) =>
  sequelize.define("Rooms", {
    name:{
      type:DataTypes.STRING,
      require:true
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
      type: DataTypes.JSONB,
      defaultValue: null,
      get() {
        return JSON.parse(this.getDataValue("message_history"));
      },
      set(value) {
        return this.setDataValue("message_history", JSON.stringify(value));
      },
    },
  });

module.exports = roomModel;
