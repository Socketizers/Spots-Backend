"use strict";

//------------------------------------------------
// Model Schema
//------------------------------------------------

const privateRoomModel = (sequelize, DataTypes) =>
  sequelize.define("Private-Rooms", {
    room_id: { type: DataTypes.STRING },
    user1_id: { type: DataTypes.INTEGER, required: true },
    user2_id: { type: DataTypes.INTEGER, required: true },
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

module.exports = privateRoomModel;
