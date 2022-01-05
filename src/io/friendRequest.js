const { socketIo } = require("../server");

socketIo.on("connection", (client) => {
    client.on("join-request-room", (myId) => {
        client.join(`${myId}`);
    })

    client.on("new-friendRequest", (friendId) => {
       client.broadcast.to(`${friendId}`).emit("new-friendRequest");
    })
  });