const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  voterid: { type: String, required: true, unique: true },
  candidateName: { type: String, required: true },
  subdivision: { type: String, required: true },
  votedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vote', voteSchema);
