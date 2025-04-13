const mongoose = require("mongoose");

const seatBookingSchema = new mongoose.Schema({
  busNo: { type: String, required: true },
  seatNumber: { type: Number, required: true },
  email: { type: String, required: true },
  status: { type: String, enum: ['booked', 'available'], default: 'booked' },
  bookedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SeatBooking", seatBookingSchema);
