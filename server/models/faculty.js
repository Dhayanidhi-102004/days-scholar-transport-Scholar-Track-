const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
},{ collection: 'Faculty' }); 

const Faculty = mongoose.model('Faculty', facultySchema);

module.exports = Faculty;