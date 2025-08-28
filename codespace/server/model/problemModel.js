const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const problemSchema = new mongoose.Schema({
  id: { type: String, default: randomUUID, unique: true },
  problem_name: String,
  statement: String,
  sinput: String,
  soutput: String,
}, { id: false });

module.exports = mongoose.model('Problem Packages', problemSchema);
