const { socketIo } = require("../server");

socketIo.on("connection", (socket) => {
  socket.on("join_video", (userInfo, room, peerId) => {
    console.log(userInfo, room, peerId);
    socket.join(room);
    socket.broadcast.to(room).emit("new_user_joined", userInfo, peerId);
  });
});
