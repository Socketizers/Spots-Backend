"use strict";
/**
 *
 * @param {string} capability
 * @description  check if user has capability to access the resource or not
 * @returns a middleware function that checks if the user has the capability to access the route
 */
module.exports = (capability) => {
  return (req, res, next) => {
    try {
      if (req.user.capabilities.includes(capability)) {
        next();
      } else {
        next("Access Denied");
      }
    } catch (e) {
      next("Invalid Login");
    }
  };
};
