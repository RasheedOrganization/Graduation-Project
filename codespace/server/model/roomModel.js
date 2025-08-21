const mongoose = require('mongoose');
const Message = require('./messageModel');

const roomSchema = new mongoose.Schema({
  roomid: { type: String, required: true, unique: true, match: /^\d{4}$/ },
  isPrivate: { type: Boolean, default: false },
  password: { type: String },
});

roomSchema.pre('findOneAndDelete', async function (next) {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await Message.deleteMany({ room: doc._id });
  }
  next();
});

module.exports = mongoose.model('Room', roomSchema);
