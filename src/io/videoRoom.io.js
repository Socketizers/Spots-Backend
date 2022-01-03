"use strict";

const { socketIo } = require("../server");

socketIo.on("connection", (socket) => {
  /**
   1. join_video event is used to let the user join a room, 
   and to emit new_user_joined event.
   2. userInfo and room will be passed by submitting a form that has 
   an event listener on submit in abb.js. peerId will take the value 
   from Peer js.  
   */
  socket.on("join_video", (userInfo, room, peerId) => {
    socket.join(room);
    socket.broadcast.to(room).emit("new_user_joined", userInfo, peerId);

    /*
    disconnect event is used to emit user-disconnected event
     to close the video share at the receiver user immediately 
     when the socket is disconnected 
    */
    socket.on("disconnect", () => {
      socket.broadcast.to(room).emit("user-disconnected", peerId);
    });
    socket.on("peer-disconnect", () => {
      socket.broadcast.to(room).emit("user-disconnected", peerId);
    });
  });
});
