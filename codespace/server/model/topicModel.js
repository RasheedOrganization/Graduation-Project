const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  subtopic: { type: String, required: true }
});

// Ensure each topic/subtopic pair is unique
topicSchema.index({ topic: 1, subtopic: 1 }, { unique: true });

module.exports = mongoose.model('Topic', topicSchema);
