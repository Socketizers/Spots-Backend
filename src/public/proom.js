const myPeer = new Peer(undefined, {
  secure: true,
  host: "peertestjs.herokuapp.com",
  port: 443,
});
const socket = io();
let peers = {};
let userName;
let myStream;
console.log(myPeer);

const roomForm = document.getElementById("room-form");
const roomMessage = document.getElementById("message-form");
const roomList = document.getElementById("room-list");

//---------------------------------------
//Fetch room data
//----------------------------------------

async function  roomsList() {
  
  const roomsRes = await fetch('http://localhost:8080/rooms/server/1');
  console.log(roomsRes);
  const  allRooms = await roomsRes.json();
  console.log(allRooms);
  roomList.innerHTML='<h2>Rooms</h2>'
  allRooms.forEach((room) => {
    let roomElement = document.createElement("button");
    roomElement.value = room.id;
    roomElement.name = room.type;
    roomElement.textContent = 'class-'+ room.id;
    // roomElement.addEventListener("click",videoRender);
    roomList.appendChild(roomElement);
    
  });
  let roomsNum = document.createElement("h3");
  roomsNum.textContent= allRooms.length;
  roomList.appendChild(roomsNum);
}

roomsList();

//-----------------------------------------

// roomForm.addEventListener("submit", (e) => {
//   e.preventDefault();
//   const roomName = e.target.room.value;
//   userName = e.target.name.value;
//   socket.emit("join_text", userName, roomName);
// });
// roomMessage.addEventListener("submit", (e) => {
//   e.preventDefault();
//   const message = e.target.message.value;
//   socket.emit("new_message", message, userName);
// });
// socket.on("new_message", (message, userName) => {
//   const messageElement = document.createElement("div");
//   messageElement.innerText = `${userName}: ${message}`;
//   document.querySelector("#messages").appendChild(messageElement);
// });



// const videoRoomForm = document.getElementById("video-form");

// async function videoRender() {
//  console.log('===============>',this.name);
//   const roomVideo = this.value;
//   userName = this.value;

//   const stream =
//     this.value === "camera"
//       ? await navigator.mediaDevices.getUserMedia({
//           video: { facingMode: "user" },
//           audio: {
//             sampleSize: 8,
//             echoCancellation: true,
//           },
//         })
//       : await navigator.mediaDevices.getDisplayMedia({
//           video: {
//             cursor: "always",
//           },
//           audio: true,
//         });
//   // stream.addTrack(stream.getVideoTracks()[0]);
//   const audioTrack = (
//     await navigator.mediaDevices.getUserMedia({ audio: true })
//   ).getAudioTracks()[0];
//   stream.addTrack(audioTrack);
//   myStream = stream;
//   const videoStream = document.createElement("video");
//   addVideoStream(videoStream, stream);

//   videoStream.muted = true;
//   socket.on("new_user_joined", (_, userId) => {
//     console.log(userId);
//     connectToNewUser(userId, stream);
//   });

//   socket.emit("join_video", userName, roomVideo, myPeer.id);
// };

// function addVideoStream(videoStream, stream) {
//   const video = document.getElementById("local-video");
//   videoStream.width = "300";
//   videoStream.height = "300";
//   videoStream.srcObject = stream;
//   videoStream.addEventListener("loadedmetadata", () => videoStream.play());
//   video.appendChild(videoStream);
// }

// myPeer.on("call", (call) => {
//   call.answer(myStream);
//   const video = document.createElement("video");
//   call.on("stream", (userVideoStream) => {
//     console.log("stream");
//     addVideoStream(video, userVideoStream);
//   });
// });

// function connectToNewUser(userId, stream) {
//   const call = myPeer.call(userId, stream);
//   console.log(call);
//   const video = document.createElement("video");

//   call.on("stream", (remoteStream) => {
//     console.log("__stream");
//     addVideoStream(video, remoteStream);
//   });

//   call.on("close", () => {
//     console.log("close");
//     video.remove();
//   });
//   peers[userId] = call;
// }

// privet chat

const pRoomForm = document.querySelector("#pRoom-form");
const pMessage = document.querySelector("#pMessage-form");
let myId;
let idUser2;

pRoomForm.addEventListener("submit", (e) => {
  e.preventDefault();
  myId = e.target.user1.value;
  if (e.target.user2.value) {
    idUser2 = e.target.user2.value;
    socket.emit("join-private-room", myId, idUser2);
  }
});
const privateMsg = {};
socket.on("join-privet-room-user2", (userId, user2, roomName) => {
  if (myId === user2) {
    idUser2 = userId;
    privateMsg[userId] = roomName;
    socket.emit("join-privet-room-user2", roomName);
  }
});

pMessage.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = e.target.pMessage.value;
  console.log(myId, idUser2, message);
  const [a, b] = privateMsg[idUser2]?.split("|") ?? [myId, idUser2];
  socket.emit("new_private_message", a, b, message);
});

socket.on("new_private_message", (message, user1, user2) => {
  const messageElement = document.createElement("div");
  messageElement.innerText = `${user2}: ${message}`;
  document.querySelector("#messages").appendChild(messageElement);
});

