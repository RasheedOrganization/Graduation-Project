const rooms = {};

function addUserToRoom(roomid, userid) {
  if (!rooms[roomid]) {
    rooms[roomid] = [];
  }
  rooms[roomid].push(userid);
}

function removeUserFromRoom(roomid, userid) {
  if (!rooms[roomid]) return;
  rooms[roomid] = rooms[roomid].filter((u) => u !== userid);
  if (rooms[roomid].length === 0) {
    delete rooms[roomid];
  }
}

function getUsersInRoom(roomid) {
  return rooms[roomid] || [];
}

function getAllRooms() {
  return rooms;
}

module.exports = {
  addUserToRoom,
  removeUserFromRoom,
  getUsersInRoom,
  getAllRooms,
};
