const RoomUser = require('../model/roomUserModel');
const Message = require('../model/messageModel');
const Room = require('../model/roomModel');

async function addUserToRoom(roomid, userid, username) {
  await RoomUser.findOneAndUpdate(
    { roomid, userid },
    { username },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function removeUserFromRoom(roomid, userid) {
  await RoomUser.deleteOne({ roomid, userid });
}

async function getUsersInRoom(roomid) {
  return await RoomUser.find({ roomid });
}

async function getAllRooms() {
  const users = await RoomUser.find({});
  const rooms = {};
  users.forEach(u => {
    if (!rooms[u.roomid]) rooms[u.roomid] = [];
    rooms[u.roomid].push({ userid: u.userid, username: u.username, micOn: u.micOn });
  });
  return rooms;
}

async function updateMicStatus(roomid, userid, micOn) {
  await RoomUser.findOneAndUpdate({ roomid, userid }, { micOn });
}

async function addMessage(roomid, userid, username, msg) {
  const room = await Room.findOne({ roomid });
  if (!room) return;
  const message = new Message({ room: room._id, roomid, userid, username, message: msg });
  await message.save();
}

async function getMessages(roomid, limit = 50) {
  const messages = await Message.find({ roomid })
    .sort({ createdAt: -1 })
    .limit(limit);
  return messages.reverse();
}

async function deleteMessages(roomid) {
  await Message.deleteMany({ roomid });
}

module.exports = {
  addUserToRoom,
  removeUserFromRoom,
  getUsersInRoom,
  getAllRooms,
  updateMicStatus,
  addMessage,
  getMessages,
  deleteMessages,
};
