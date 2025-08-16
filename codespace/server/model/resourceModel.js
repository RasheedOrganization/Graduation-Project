const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  link: { type: String, required: true },
  topic: { type: String, required: true },
  subtopic: { type: String, required: true },
  status: { type: String, default: 'Not Attempted' }
});

module.exports = mongoose.model('Resource', resourceSchema);
