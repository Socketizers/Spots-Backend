const myPeer = new Peer(undefined, {
  secure: true,
  host: "peertestjs.herokuapp.com",
  port: 443,
});
const socket = io();

let peers = {};
const roomForm = document.querySelector("#room-form");
let userName;
let myStream;
console.log(myPeer);
const roomMessage = document.querySelector("#message-form");
socket.connect;
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
