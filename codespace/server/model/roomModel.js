const mongoose = require('mongoose');
const Message = require('./messageModel');

const testSchema = new mongoose.Schema(
  {
    input: { type: String },
    output: { type: String },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema({
  roomid: { type: String, required: true, unique: true, match: /^\d{4}$/ },
  isPrivate: { type: Boolean, default: false },
  password: { type: String },
  // persisted collaborative state
  code: { type: String, default: '' },
  statement: { type: String, default: '' },
  sampleInput: { type: String, default: '' },
  sampleOutput: { type: String, default: '' },
  language: { type: String, default: 'cpp' },
  input: { type: String, default: '' },
  tests: { type: [testSchema], default: [] },
});

roomSchema.pre('findOneAndDelete', async function (next) {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await Message.deleteMany({ room: doc._id });
  }
  next();
});

module.exports = mongoose.model('Room', roomSchema);
