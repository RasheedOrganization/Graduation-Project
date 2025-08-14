const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomid: { type: String, required: true, unique: true, match: /^\d{4}$/ },
  isPrivate: { type: Boolean, default: false },
  password: { type: String },
});

module.exports = mongoose.model('Room', roomSchema);
