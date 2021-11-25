const express = require("express");
const app = express();
const notFound = require("./error-handlers/404");
const errorHandler = require("./error-handlers/500");
const logger = require("./middleware/logger");
const serverRout = require("./routes/server.routes");
const authRouts = require("./routes/auth.routes");
const roomRoutes = require("./routes/room.routes");

// To merge socket io with the server
const { createServer } = require("http");

// Render the server
app.use(express.json());
app.use(logger);
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Routes using
app.use("/server", serverRout);
app.use("/room", roomRoutes);
app.use(authRouts);

// Error handlers
app.use("*", notFound);
app.use(errorHandler);

const server = createServer(app);

const start = (Port) => {
  server.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
  });
};

module.exports = {
  start,
  server,
};
require("./io/server.io");
