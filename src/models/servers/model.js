"use strict";

//------------------------------------------------
// Model Schema
//------------------------------------------------

<<<<<<< HEAD
const servers = (sequelize, DataTypes) => 
  sequelize.define("servers", {
=======
const serverModel = (sequelize, DataTypes) => {
  return sequelize.define("Servers", {
>>>>>>> routesInit
    name: { type: DataTypes.STRING, required: true, unique: true },
    description: { type: DataTypes.STRING, required: true },
    category: { type: DataTypes.STRING, required: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    image: { type: DataTypes.STRING, required: true },
    public: { type: DataTypes.BOOLEAN, required: true },
    users: { type: DataTypes.ARRAY(DataTypes.STRING) },
  });


// Server.associate = models =>{
//   models.belongsTo(models.User,{
//     foreignKey:{
//       allowNull:false
//     }
//   })
// }

module.exports = servers;
