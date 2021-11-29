"use strict";

const socket = io();

let userName;

const roomForm = document.getElementById("join-room-form");
const roomMessage = document.getElementById("message-form");

roomForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const roomName = e.target.room.value;
  userName = e.target.name.value;
  socket.emit("join_text", userName, roomName);
});

roomMessage.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = e.target.message.value;
  socket.emit("new_message", message, userName);
});

socket.on("new_message", (message, userName) => {
  const messageElement = document.createElement("div");
  messageElement.innerText = `${userName}: ${message}`;
  document.getElementById("messages").appendChild(messageElement);
});