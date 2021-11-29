"use strict";

//------------------------------------------------
// Model Schema
//------------------------------------------------

const servers = (sequelize, DataTypes) =>
  sequelize.define("servers", {
    name: {
      type: DataTypes.STRING,
      required: true,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      required: true,
    },
    category: {
      type: DataTypes.STRING,
      required: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      required: true,
      defaultValue:
        "https://img.favpng.com/12/19/14/discord-internet-bot-user-avatar-computer-servers-png-favpng-pMhCmZvgHpA9cT20mtKY40a0t.jpg",
    },
    public: {
      type: DataTypes.BOOLEAN,
      required: true,
    },
    rooms_num: {
      type: DataTypes.INTEGER,
    },
    // users: {
    //   type: DataTypes.ARRAY(DataTypes.INTEGER),
    // },
  });

module.exports = servers;
