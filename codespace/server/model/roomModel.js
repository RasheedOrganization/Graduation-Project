const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomid: { type: String, required: true, unique: true },
  isPrivate: { type: Boolean, default: false },
  password: { type: String },
});

module.exports = mongoose.model('Room', roomSchema);
