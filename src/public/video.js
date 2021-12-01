const myPeer = new Peer(undefined, {
  secure: true,
  host: "spotspeer.herokuapp.com",
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

async function roomsList() {
  const roomsRes = await fetch(
    "https://socketizers.herokuapp.com/rooms/server/1"
  );
  console.log(roomsRes);
  const allRooms = await roomsRes.json();
  console.log(allRooms);
  roomList.innerHTML = "<h2>Server Name</h2>";
  allRooms.forEach((room) => {
    let roomElement = document.createElement("button");
    roomElement.value = room.id;
    roomElement.name = room.type;
    roomElement.textContent = "class-" + room.id;
    roomElement.addEventListener("click", setRoomId);
    roomList.appendChild(roomElement);
  });
  let roomsNum = document.createElement("h3");
  roomsNum.textContent = allRooms.length;
  roomList.appendChild(roomsNum);
}

roomsList();

const videoRoomForm = document.getElementById("video-form");
const cameraButton = document.getElementById("camera-btn");
const shareButton = document.getElementById("share-btn");
const micButton = document.getElementById("mic-btn");

let roomVideo;

function setRoomId() {
  console.log("===============>", this.name);
  roomVideo = this.value;
  userName = this.value;
  const video = document.getElementById("local-video");
  video.textContent = "";
  cameraButton.addEventListener("click", videoRender);
  shareButton.addEventListener("click", videoRender);
  micButton.addEventListener("click", videoRender);
}

async function videoRender() {
  if (this.value === "mic") {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleSize: 8,
        echoCancellation: true,
      },
    });
    const audioTrack = (
      await navigator.mediaDevices.getUserMedia({ audio: true })
    ).getAudioTracks()[0];
    stream.addTrack(audioTrack);
    const videoStream = document.createElement("video");
    addVideoStream(videoStream, stream);
    videoStream.muted = true;
    socket.on("new_user_joined", (_, userId) => {
      console.log(userId);
      connectToNewUser(userId, stream);
    });

    socket.emit("join_video", userName, roomVideo, myPeer.id);
  } else {
    const stream =
      this.value === "camera"
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
  }
}

function addVideoStream(videoStream, stream) {
  const video = document.getElementById("local-video");
  videoStream.width = "350";
  videoStream.height = "350";
  videoStream.controls = true;
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
socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});
