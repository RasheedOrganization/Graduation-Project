const rooms = {};

function addUserToRoom(roomid, userid, username) {
  if (!rooms[roomid]) {
    rooms[roomid] = [];
  }
  rooms[roomid].push({ userid, username });
}

function removeUserFromRoom(roomid, userid) {
  if (!rooms[roomid]) return;
  rooms[roomid] = rooms[roomid].filter((u) => u.userid !== userid);
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
