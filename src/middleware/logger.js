"use strict";

// All middleware has access to the request.
// Here, we're simply logging out the interesting parts
const logger = (req, res, next) => {
  console.log("REQUEST:", req.method, req.path);
  next();
};

module.exports = logger;
