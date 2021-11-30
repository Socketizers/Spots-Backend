"use strict";

const socket = io();

const roomList = document.getElementById("room-list");
//---------------------------------------
//Fetch room data
//----------------------------------------
let roomName;

async function roomsList() {
  const roomsRes = await fetch(`http://localhost:8080/rooms/server/1`);
  const allRooms = await roomsRes.json();
  allRooms.forEach((room) => {
    let roomElement = document.createElement("button");
    roomElement.value = room.id;
    roomElement.name = room.type;
    roomElement.textContent = "class-" + room.id;
    roomElement.addEventListener("click", () => {
      roomName = "class-" + room.id;
    });
    document.getElementById("roomsDiv").appendChild(roomElement);
  });
  let roomsNum = document.createElement("h3");
  roomsNum.textContent = allRooms.length;
  roomList.appendChild(roomsNum);
}

roomsList();

// **************************🟩 Start of Messaging events 🟩*************************************

let userName;

const roomForm = document.getElementById("join-room-form");
const roomMessage = document.getElementById("message-form");
const startChat = document.getElementById("start-chat");

roomForm.addEventListener("submit", (e) => {
  e.preventDefault();
  userName = e.target.name.value;
  const chatRoom = document.createElement("h2");
  chatRoom.innerText = `${roomName}`;
  chatRoom.setAttribute("id", "chatRoom");
  document.getElementById("messages-area").appendChild(chatRoom);
  socket.emit("join_text", userName, roomName);
});

roomMessage.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = e.target.message.value;
  const messageElement = document.createElement("p");
  messageElement.innerHTML = `<b>${userName}</b><br>${message}`;
  messageElement.setAttribute("class", "right-message");
  document.getElementById("messages-area").appendChild(messageElement);
  socket.emit("new_message", message, userName);
});

socket.on("new_message", (message, userName) => {
  const messageElement = document.createElement("p");
  messageElement.innerHTML = `<b>${userName}</b><br>${message}`;
  messageElement.setAttribute("class", "left-message");
  document.getElementById("messages-area").appendChild(messageElement);
});

// **************************🟥 End of Messaging events🟥 *************************************
