'use strict';

const { Sequelize, DataTypes } = require('sequelize');


const DATABASE_URL = process.env.NODE_ENV === 'test' ? 'sqlite:memory;' : process.env.DATABASE_URL;

// For Deployment 
const DATABASE_CONFIG = process.env.NODE_ENV === 'production' ? { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } } : {}

const sequelize = new Sequelize(DATABASE_URL, DATABASE_CONFIG);

// require the models/schemas
const usersModel = require('./users/model');
const serversModel = require('./servers/model');
const roomsModel = require('./rooms/model');
const privateRoomsModel = require('./private-rooms/model');

// tables
const usersTable = usersModel(sequelize, DataTypes);
const serversTable = serversModel(sequelize, DataTypes);
const roomsTable = roomsModel(sequelize, DataTypes);
const privateRoomsTable = privateRoomsModel(sequelize, DataTypes);


// Tables Relations

//  Users - Servers
usersTable.hasMany(serversTable,{foreignKey:'user_id',sourceKey:'id'});
serversTable.belongsTo(serversTable,{foreignKey:'user_id',targetKey:'id'})

//  Servers - Rooms
serversTable.hasMany(roomsTable,{foreignKey:'server_id',sourceKey:'id'});
roomsTable.belongsTo(serversTable,{foreignKey:'server_id',targetKey:'id'});

//  Users - Private-Rooms

//For the first user
usersTable.hasMany(privateRoomsTable,{foreignKey:'user1_id',sourceKey:'id'});
privateRoomsTable.belongsTo(usersTable,{foreignKey:'user1_id',targetKey:'id'});

// //For the second user
usersTable.hasMany(privateRoomsTable,{foreignKey:'user2_id',sourceKey:'id'});
privateRoomsTable.belongsTo(usersTable,{foreignKey:'user2_id',targetKey:'id'});


module.exports = {
    db: sequelize,
    users: usersTable,
    servers: serversTable,
    rooms: roomsTable,
    privateRooms: privateRoomsTable
}