const express = require("express");
const app = express();
const notFound = require("./error-handlers/404");
const errorHandler = require("./error-handlers/500");
const logger = require("./middleware/logger");
const serverRout = require("./routes/server.routes");
const authRouts = require("./routes/auth.routes");
const roomRoutes = require("./routes/room.routes");

const { createServer } = require("http");

const cors = require("cors");
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use(cors());

app.use(logger);
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.use("/public", express.static(__dirname + "/public"));
app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Routes using
app.use(serverRout);
app.use(roomRoutes);
app.use(authRouts);

const server = createServer(app);
const io = require("socket.io");

const socketIo = io(server);

app.use("*", notFound);
app.use(errorHandler);
const start = (Port) => {
  server.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
  });
};

module.exports = {
  start,
  server,
  socketIo,
};
require("./io/server.io");
require("./io/videoRoom.io");
