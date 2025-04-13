const mongoose = require('mongoose');

const BusNoBookingSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  busNo: {
    type: String,
    required: true,
  },
  bookingDate: {
    type: Date,
    default: Date.now, // Automatically sets the current date and time
  },
});

const BusNoBookingModel = mongoose.model('BusNoBooking', BusNoBookingSchema);

module.exports = BusNoBookingModel;
