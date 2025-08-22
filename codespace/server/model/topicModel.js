const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  subtopic: { type: String, default: '' }
});

// Ensure combination of topic and subtopic is unique
// This acts like a composite primary key
// Index prevents duplicates for same topic-subtopic pair

// Create compound index with unique constraint
// Equivalent of composite primary key in relational DB
//   { topic, subtopic }
topicSchema.index({ topic: 1, subtopic: 1 }, { unique: true });

module.exports = mongoose.model('Topic', topicSchema);
