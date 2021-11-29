const express = require("express");
const app = express();

const pageNotFound = require("./error-handlers/404");
const errorHandler = require("./error-handlers/500");

const logger = require("./middleware/logger");

const serverRout = require("./routes/server.routes");
const authRouts = require("./routes/auth.routes");
const roomRoutes = require("./routes/room.routes");
const privateRoomRoutes = require("./routes/private-room.routes");

/*importing  createServer function from http module 
to connect socket io with this server*/
const { createServer } = require("http");
const storyRouter = require("./routes/story.routes");

const cors = require("cors");

app.use(cors());
app.use(express.json());

app.use(logger);

// using uploads file to save images
app.use("/uploads", express.static("uploads"));

// setting pug view engine to be alternative for react in front end
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/home", (req, res) => {
  res.render("home");
});

// root route to check if the server is working
app.get("/", (req, res) => {
  res.send("Hello World 🤑");
});

// Routes using
app.use(serverRout);
app.use(roomRoutes);
app.use("/story", storyRouter);
app.use(authRouts);
app.use(privateRoomRoutes);

// creating a server that will enable socket io to connect with this server
const server = createServer(app);
const io = require("socket.io");
const socketIo = io(server);

// error handlers using
app.use("*", pageNotFound);
app.use(errorHandler);

// start function
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
require("./io/privateRoom.io");
