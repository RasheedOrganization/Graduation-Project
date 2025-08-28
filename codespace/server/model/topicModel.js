const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const topicSchema = new mongoose.Schema({
  id: { type: String, default: randomUUID, unique: true },
  stage: {
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
}, { id: false });

// Ensure each stage/topic/subtopic combination is unique
topicSchema.index({ stage: 1, topic: 1, subtopic: 1 }, { unique: true });

module.exports = mongoose.model('Topic', topicSchema);
