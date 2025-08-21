const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    roomid: { type: String, required: true },
    userid: { type: String, required: true },
    username: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
