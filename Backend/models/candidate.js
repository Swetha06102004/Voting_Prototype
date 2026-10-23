const mongoose = require('mongoose');

// Define the Candidate schema
const candidateSchema = new mongoose.Schema({
  candidateName: { type: String, required: true },
  partyName: { type: String, required: true },
  symbol: { type: String, required: true },
  subdivision: { type: String, required: true },
  votes: { type: Number, default: 0 },  // Default votes to 0
});

// Create and export the Candidate model
const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;
