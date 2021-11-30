const { socketIo } = require("../server");
const { users, privateRooms } = require("../models/index");
const { Op } = require("sequelize");
socketIo.on("connection", (client) => {
  client.on("join-private-room", (myId) => {
    client.join(myId);
  });
  client.on("new_private_message", async (myId, to, message) => {
    let ourRoom = await privateRooms.findOne({
      where: {
        [Op.or]: [{ room_id: to + myId }, { room_id: myId + to }],
      },
    });
    if (!ourRoom)
      ourRoom = await privateRooms.create({
        room_id: myId + to,
        user1_id: +myId,
        user2_id: +to,
      });
    const messageHistory = ourRoom.message_history || {};
    messageHistory[myId + "|" + new Date().toJSON()] = {
      message,
      time: new Date(),
    };
    console.log(messageHistory);
    await ourRoom.update({ message_history: messageHistory });
    client.broadcast.to(to).emit("new_private_message", myId, to, message);
  });
});
