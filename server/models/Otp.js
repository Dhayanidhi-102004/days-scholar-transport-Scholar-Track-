// models/Otp.js (New OTP Model)
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 }, // Auto-delete after 60 seconds
});

const OtpModel = mongoose.model("Otp", otpSchema);
module.exports = OtpModel;
