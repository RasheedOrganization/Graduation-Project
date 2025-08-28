const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const practiceProblemSchema = new mongoose.Schema({
  id: { type: String, default: randomUUID, unique: true },
  name: { type: String, required: true },
  link: { type: String, required: true },
  stage: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold'],
    required: true,
  },
  topic: { type: String, required: true },
  subtopic: { type: String, required: true },
  difficulty: { type: String, required: true },
  domain: { type: String, required: true },
  status: { type: String, default: 'Not Attempted' }
}, { id: false });

module.exports = mongoose.model('PracticeProblem', practiceProblemSchema);
