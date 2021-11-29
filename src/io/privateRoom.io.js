const { socketIo } = require("../server");
const { users, privateRooms } = require("../models/index");

socketIo.on("connection", (client) => {
  client.on("join-private-room", async (userId, user2Id) => {
    const user2 = await users.findOne({ id: user2Id });
    if (user2.onlineStatus) {
      client.join(userId + "|" + user2Id);
      socketIo.emit(
        "join-privet-room-user2",
        userId,
        user2Id,
        userId + "|" + user2Id
      );
    }
  });

  client.on("join-privet-room-user2", (roomName) => {
    client.join(roomName);
  });

  client.on("new_private_message", async (userId, user2Id, message) => {
    console.log(`userId, user2Id, message`, userId, user2Id, message);

    let ourRoom = await privateRooms.findOne({
      where: { user1_id: userId, user2_id: user2Id },
    });
    if (!ourRoom) ourRoom = await privateRooms.create({
      user1_id: userId,
      user2_id: user2Id,
    });
    console.log(`ourRoom`, ourRoom);
    const messageHistory = ourRoom.message_history || [];
    messageHistory.push(message);
    await ourRoom.update({ message_history: null });
    await ourRoom.update({ message_history: messageHistory });
    client.broadcast
      .to(userId + "|" + user2Id)
      .emit("new_private_message", userId, user2Id, message);
  });
});
