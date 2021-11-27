const { socketIo } = require("../server");
let roomName = "";
socketIo.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("join_text", (userInfo, room) => {
    roomName = room;
    socket.join(room);
    socket.to(roomName).emit("connected", userInfo);
  });
  socket.on("new_message", (message, userInfo) => {
    socket.broadcast.to(roomName).emit("new_message", message, userInfo);
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
