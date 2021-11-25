const socket = io();
const roomForm = document.querySelector("#room-form");
let userName;
const roomMessage = document.querySelector("#message-form");
roomForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const roomName = e.target.room.value;
  userName = e.target.name.value;
  socket.emit("join", userName, roomName);
});
roomMessage.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = e.target.message.value;
  socket.emit("new_message", message, userName);
});
socket.on("new_message", (message, userName) => {
  const messageElement = document.createElement("div");
  messageElement.innerText = `${userName}: ${message}`;
  document.querySelector("#messages").appendChild(messageElement);
});
