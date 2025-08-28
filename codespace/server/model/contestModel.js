const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startTime: { type: Date, required: true },
  duration: { type: Number, required: true },
  status: {
    type: String,
    enum: ['upcoming', 'running', 'finished'],
    default: 'upcoming'
  },
  problems: [{ type: String }],
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Contest', contestSchema);
