const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  id: String,
  problem_name: String,
  statement: String,
  sinput: String,
  soutput: String,
});

module.exports = mongoose.model('Problem Packages', problemSchema);
