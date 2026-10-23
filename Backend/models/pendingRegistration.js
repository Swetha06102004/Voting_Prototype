const mongoose = require('mongoose');

const pendingSchema = new mongoose.Schema({
  name: String,
  dob: String,
  aadhar: String,
  voterid: String,
  mobile: String,
  gender: String,
  state: String,
  district: String,
  subdivision: String,
  photo: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PendingRegistration', pendingSchema);
