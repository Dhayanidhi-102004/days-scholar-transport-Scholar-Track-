const mongoose = require('mongoose');

const facultyRequestSchema = new mongoose.Schema({
  name: String,
  department: String,
  contact: String,
  place: String,
  email: { type: String, required: true },
  password: { type: String, required: true },
  status: { type: String, default: 'pending' } // pending, approved, rejected
});

const FacultyRequest = mongoose.model('FacultyRequest', facultyRequestSchema);

module.exports = FacultyRequest;
