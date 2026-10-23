const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  name: String,
  dob: String,
  aadhar: { type: String, unique: true },
  voterid: { type: String, unique: true },
  gender: String,
  state: String,
  district: String,
  subdivision: String,
  photo: String,
  mobile: String,
  hasVoted: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
});

module.exports = mongoose.model('Registration', RegistrationSchema);
