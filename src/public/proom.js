"use strict";

//---------------------------------------
//Fetch room data
//----------------------------------------

// privet chat
const socket = io();
const pRoomForm = document.querySelector("#pRoom-form");
const pMessage = document.querySelector("#pMessage-form");

let myInfo;
let idUser2;

const singInForm = document.getElementById("sign-in");
const formContainer = document.getElementById("formContainer");
const userList = document.getElementById("user-list");
async function roomsList() {
  const token = localStorage.getItem("token");

  const myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer " + token);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };
  const users = await fetch("http://localhost:8080/users", requestOptions);
  const allUsers = await users.json();
  userList.innerHTML = "<h2>Server Name</h2>";
  allUsers.forEach((user) => {
    let roomElement = document.createElement("button");
    roomElement.value = user.id;
    roomElement.textContent = user.username;
    // roomElement.addEventListener("click", setRoomId);
    userList.appendChild(roomElement);
  });
  let roomsNum = document.createElement("h3");
  roomsNum.textContent = allUsers.length;
  userList.appendChild(roomsNum);
}
userList.addEventListener("click", async (e) => {
  if (e.target.tagName === "BUTTON") {
    idUser2 = e.target.value;
  }
});

singInForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("sign in");
  try {
    const myHeaders = new Headers();

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      redirect: "follow",
    };

    myHeaders.append(
      "Authorization",
      btoa(e.target.name.value + ":" + e.target.password.value)
    );

    const userInfo = await fetch(
      "http://localhost:5000/sign-in",
      requestOptions
    );
    console.log(userInfo);
    if (userInfo.status === 403) {
      alert("Wrong username or password");
    } else {
      const user = await userInfo.json();
      console.log(user);
      myInfo = user;
      formContainer.style.display = "none";
      if (localStorage.getItem("token")) localStorage.removeItem("token");
      localStorage.setItem("token", user.token);
      socket.emit("join-private-room", myInfo.id);
      roomsList();
    }
  } catch (err) {
    console.log(err);
  }
});

pMessage.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = e.target.pMessage.value;
  socket.emit("new_private_message", myInfo.id, idUser2, message);
});

socket.on("new_private_message", (message, user1, user2) => {
  const messageElement = document.createElement("div");
  messageElement.innerText = `${user2}: ${message}`;
  document.querySelector("#messages").appendChild(messageElement);
});
