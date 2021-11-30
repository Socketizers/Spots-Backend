"use strict";

//---------------------------------------
//Fetch room data
//----------------------------------------

// privet chat
const socket = io("/");
const pRoomCont = document.getElementById("messages");
const pMessage = document.querySelector("#message-form");
pRoomCont.style.display = "none";
let myInfo;
let idUser2;
let allUsers;
const singInForm = document.getElementById("sign-in");
const formContainer = document.getElementById("formContainer");
const userList = document.getElementById("user-list");
let requestOptions;
async function roomsList() {
  const token = localStorage.getItem("token");

  const myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer " + token);

  requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };
  const users = await fetch(
    "https://socketizers.herokuapp.com/users",
    requestOptions
  );
  allUsers = await users.json();
  userList.innerHTML = "<h2>Friends messages</h2>";
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
  document.querySelector("#messages-area").innerHTML = "";
  if (e.target.tagName === "BUTTON") {
    idUser2 = e.target.value;
    try {
      const chat = await fetch(
        `https://socketizers.herokuapp.com/users/${idUser2}`,
        requestOptions
      );
      const all = await chat.json();
      console.log(all);
      Object.entries(all.message_history).forEach(([key, value]) => {
        const userName =
          key.split("|")[0] === `${myInfo.user.id}`
            ? myInfo.user.username
            : allUsers.find((user) => user.id === Number(key.split("|")[0]))
                .username;
        renderMessage(
          value.message,
          key.split("|")[0] === `${myInfo.user.id}`,
          userName
        );
      });
    } catch (e) {
      console.log(e);
    }
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
      "https://socketizers.herokuapp.com/sign-in",
      requestOptions
    );
    if (userInfo.status === 403) {
      alert("Wrong username or password");
    } else {
      const user = await userInfo.json();
      myInfo = user;
      formContainer.style.display = "none";
      if (localStorage.getItem("token")) localStorage.removeItem("token");
      localStorage.setItem("token", user.token);
      socket.emit("join-private-room", myInfo.user.id);
      roomsList();
      pRoomCont.style.display = "block";
    }
  } catch (err) {
    console.log(err);
  }
});

function renderMessage(message, forMy, userName) {
  const messageElement = document.createElement("div");
  messageElement.classList.add(forMy ? "right-message" : "left-message");
  messageElement.innerText = `${userName} : ${message}`;
  document.querySelector("#messages-area").appendChild(messageElement);
}
pMessage.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = e.target.message.value;
  renderMessage(message, true, myInfo.user.username);
  socket.emit("new_private_message", `${myInfo.user.id}`, idUser2, message);
});

socket.on("new_private_message", (user1, user2, message) => {
  const messageElement = document.createElement("div");
  const from = allUsers.find((user) => {
    return user.id === Number(user1);
  });
  renderMessage(message, false, from.username);
  document.querySelector("#messages-area").appendChild(messageElement);
});
