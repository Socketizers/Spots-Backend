"use strict";

const friendRequest = (sequelize, DataTypes) => {
  return sequelize.define("Friends", {
    user1_id: {
      type: DataTypes.INTEGER,
      required: true,
    },
    user2_id: {
      type: DataTypes.INTEGER,
      required: true,
    },
    pending: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    response: {
      type: DataTypes.ENUM("yes", "no"),
      defaultValue: null,
    },
  });
};

module.exports = friendRequest;
