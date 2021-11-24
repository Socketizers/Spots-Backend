const io = require("socket.io");
const { server } = require("../server");
const socketIo = io(server);
let roomName = "";

socketIo.on("connection", (socket) => {
  socket.on("join", (userInfo, room) => {
    roomName = room;
    socket.join(room);
    socket.to(roomName).emit("connected", userInfo);
  });
  socket.on("new_message", (message, userInfo) => {
    socketIo.sockets.sockets.forEach((soc) => {
      if (socket !== soc)
        socket.to(roomName).emit("new_message", message, userInfo);
    });
  });
});
/** console.log("Socket Connected");
  socket.on("disconnect", () => {
    console.log("Socket Disconnected");
  });
  socket.on("chat", (data) => {
    console.log(data);
    socket.broadcast.emit("chat", data);
  }); */
