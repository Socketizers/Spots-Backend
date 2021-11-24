"use strict";

//------------------------------------------------
// Model Schema
//------------------------------------------------

const serverModel = (sequelize, DataTypes) => {
  sequelize.define("Servers", {
    name: { type: DataTypes.STRING, required: true, unique: true },
    description: { type: DataTypes.STRING, required: true },
    category: { type: DataTypes.STRING, required: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    image: { type: DataTypes.STRING, required: true },
    public: { type: DataTypes.BOOLEAN, required: true },
    users: { type: DataTypes.ARRAY(DataTypes.STRING) }
  });
};

module.exports = serverModel;
