"use strict";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET || "secretstring";

//------------------------------------------------
// Model Schema
//------------------------------------------------

const User = (sequelize, DataTypes) => {
  const model = sequelize.define("Users", {
    username: { type: DataTypes.STRING, required: true, unique: true },
    fullName: { type: DataTypes.STRING, required: true },
    image: { type: DataTypes.STRING, required: true },
    password: { type: DataTypes.STRING, required: true },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      required: true,
      defaultValue: "user",
    },
    token: {
      type: DataTypes.VIRTUAL,
      get() {
        return jwt.sign({ username: this.username }, SECRET);
      },
      set(tokenObj) {
        let token = jwt.sign(tokenObj, SECRET);
        return token;
      },
    },
    capabilities: {
      type: DataTypes.VIRTUAL,
      get() {
        const acl = {
          admin: ["read", "create", "update", "delete"],
          user: ["read-user", "create-user", "update-user", "delete-user"],
        };
        return acl[this.role];
      },
    },
  });

  //------------------------------------------------
  // Securing the password before create the user
  //------------------------------------------------

  model.beforeCreate(async (user) => {
    let hashedPass = await bcrypt.hash(user.password, 10);
    user.password = hashedPass;
  });

  // //------------------------------------------------
  // // Basic Authentication of the user
  // //------------------------------------------------

  model.authenticateBasic = async function (username, password) {
    const user = await this.findOne({ where: { username } });
    const valid = await bcrypt.compare(password, user.password);
    if (valid) {
      return user;
    }
    throw new Error("Invalid User");
  };

  // //------------------------------------------------
  // // Bearer Authentication of the user
  // //------------------------------------------------

  model.authenticateToken = async function (token) {
    try {
      console.log(token);
      const parsedToken = jwt.verify(token, SECRET);
      const user = this.findOne({ where: { username: parsedToken.username } });
      if (user) {
        return user;
      }
      throw new Error("User Not Found");
    } catch (e) {
      throw new Error(e.message);
    }
  };
  return model;
};

module.exports = User;
