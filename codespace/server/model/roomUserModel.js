const mongoose = require('mongoose');

const roomUserSchema = new mongoose.Schema({
  roomid: { type: String, required: true },
  userid: { type: String, required: true },
  username: { type: String, required: true },
  micOn: { type: Boolean, default: false },
});

roomUserSchema.index({ roomid: 1, userid: 1 }, { unique: true });

module.exports = mongoose.model('RoomUser', roomUserSchema);
