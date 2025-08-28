const mongoose = require('mongoose');

const practiceProblemSchema = new mongoose.Schema({
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
  domain: { type: String, required: true }
});

module.exports = mongoose.model('PracticeProblem', practiceProblemSchema);
