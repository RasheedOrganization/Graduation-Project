const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold'],
    required: true,
  },
  topic: { type: String, required: true },
  subtopic: { type: String, required: true },
  progress: {
    type: String,
    enum: ['not started', 'reading', 'finished'],
    default: 'not started',
  },
});

// Ensure each level/topic/subtopic combination is unique
topicSchema.index({ level: 1, topic: 1, subtopic: 1 }, { unique: true });

module.exports = mongoose.model('Topic', topicSchema);
