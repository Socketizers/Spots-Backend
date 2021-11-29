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
const roomForm = document.querySelector("#room-form");
const roomMessage = document.querySelector("#message-form");

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
  document.querySelector("#messages").appendChild(messageElement);
});

const videoRoomForm = document.getElementById("video-form");
videoRoomForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const roomVideo = e.target.roomVideo.value;
  userName = e.target.name.value;

  const stream =
    e.target.media.value === "camera"
      ? await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: {
            sampleSize: 8,
            echoCancellation: true,
          },
        })
      : await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always",
          },
          audio: true,
        });
  // stream.addTrack(stream.getVideoTracks()[0]);
  const audioTrack = (
    await navigator.mediaDevices.getUserMedia({ audio: true })
  ).getAudioTracks()[0];
  stream.addTrack(audioTrack);
  myStream = stream;
  const videoStream = document.createElement("video");
  addVideoStream(videoStream, stream);

  videoStream.muted = true;
  socket.on("new_user_joined", (_, userId) => {
    console.log(userId);
    connectToNewUser(userId, stream);
  });

  socket.emit("join_video", userName, roomVideo, myPeer.id);
});
function addVideoStream(videoStream, stream) {
  const video = document.getElementById("local-video");
  videoStream.width = "300";
  videoStream.height = "300";
  videoStream.srcObject = stream;
  videoStream.addEventListener("loadedmetadata", () => videoStream.play());
  video.appendChild(videoStream);
}

myPeer.on("call", (call) => {
  call.answer(myStream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    console.log("stream");
    addVideoStream(video, userVideoStream);
  });
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  console.log(call);
  const video = document.createElement("video");

  call.on("stream", (remoteStream) => {
    console.log("__stream");
    addVideoStream(video, remoteStream);
  });

  call.on("close", () => {
    console.log("close");
    video.remove();
  });
  peers[userId] = call;
}

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

// firebase
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-app.js";
// import storage from "https://www.gstatic.com/firebasejs/9.5.0/firebase-storage.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/9.5.0/firebase-storage.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const storage = getStorage(app);
console.log(storage);

function uploadImage(file) {
  const myRef = ref(storage, "image");
  const name = +new Date() + "-" + file.name;
  file = file.files[0];

  const metadata = {
    contentType: file.type,
  };

  uploadBytes(myRef, file, metadata)
    .then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadURL) => {
        console.log("File available at", downloadURL);
      });
    })
    .catch(console.error);
}

const myFile = document.getElementById("testFile");

const uploadFile = document.getElementById("upload");
uploadFile.addEventListener("click", (e) => {
  uploadImage(myFile);
});
const deleteFile = document.getElementById("delete");
deleteFile.addEventListener("click", (e) => {
  const myRef = ref(storage, "image");
  // Delete the file
  deleteObject(myRef)
    .then(() => {
      // File deleted successfully
      console.log("File deleted successfully");
    })
    .catch((error) => {
      // Uh-oh, an error occurred
      console.log(error);
    });
});
