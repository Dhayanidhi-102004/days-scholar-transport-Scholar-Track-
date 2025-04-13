const mongoose = require("mongoose");

const BusSeatSchema = new mongoose.Schema({
  busNo: { type: String, required: true },
  seatNumber: { type: Number, required: true },
  email: { type: String, required: true, unique: false }, // One user can book a seat
  status: { type: String, enum: ["booked", "available"], default: "booked" }
});

const BusSeat = mongoose.model("BusSeat", BusSeatSchema);

module.exports = BusSeat;