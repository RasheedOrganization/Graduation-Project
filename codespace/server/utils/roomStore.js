const rooms = {};

function addUserToRoom(roomid, userid, username) {
  if (!rooms[roomid]) {
    rooms[roomid] = [];
  }
  if (!rooms[roomid].some((u) => u.userid === userid)) {
    rooms[roomid].push({ userid, username, micOn: false });
  }
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

function updateMicStatus(roomid, userid, micOn) {
  if (!rooms[roomid]) return;
  const user = rooms[roomid].find((u) => u.userid === userid);
  if (user) {
    user.micOn = micOn;
  }
}

module.exports = {
  addUserToRoom,
  removeUserFromRoom,
  getUsersInRoom,
  getAllRooms,
  updateMicStatus,
};
