"use strict";

const { socketIo } = require("../server");

// roomName assigned as a global variable to be used in new_message event
// let roomName = "";

socketIo.on("connection", (socket) => {
  // console.log(socket.id);

  /*
  1. join_text event is used to let the users join a room.
  2. this event is emitted from app.js.
  3. userInfo and room will be passed using a form that has a listener on submit in app.js 
  */
  socket.on("join_text", (userInfo, room) => {
    socket.join(room);
    // socket.to(roomName).emit("connected", userInfo);
  });

  /*
  1. new_message event is used to send messages to the other users that in the same room with the sender
  2. this event is emitted from app.js. 
  3. message will be passed using from that has a listener on submit, and userInfo 
  will be stored as a global variable in app.js.  
  */
  socket.on("new_message", (message, userInfo, room) => {
    socket.broadcast.to(room).emit("new_message", message, userInfo);
  });

  socket.on("leave", (room) => {
    socket.leave(room)
  })
});
