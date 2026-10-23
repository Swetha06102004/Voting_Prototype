const mongoose = require('mongoose');

const DeletedVoterSchema = new mongoose.Schema({
  name: String,
  dob: String,
  aadhar: String,
  voterid: String,
  gender: String,
  state: String,
  district: String,
  subdivision: String,
  mobile: String,
  photo: String,
  deletedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeletedVoter', DeletedVoterSchema);
