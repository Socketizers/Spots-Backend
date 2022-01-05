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
      type: DataTypes.ENUM("Education","Entertainment","Sport","Career","Financial","General"),
      required: true,
      defaultValue:"General"
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      required: true,
      defaultValue: null,
    },
    public: {
      type: DataTypes.BOOLEAN,
      required: true,
    },
    rooms_num: {
      type: DataTypes.INTEGER,
    },
    users: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
    },
  });

module.exports = servers;
