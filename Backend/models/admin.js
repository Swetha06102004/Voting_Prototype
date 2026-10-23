const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed password
  role: {
    type: String,
    enum: ['election', 'dc'],
    required: true
  }
}, { collection: 'Admin' });

module.exports = mongoose.model('Admin', AdminSchema);
