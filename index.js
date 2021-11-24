require("dotenv").config();
const { start } = require("./src/server");
start(process.env.PORT || 3000);
