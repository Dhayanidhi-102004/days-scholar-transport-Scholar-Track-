const mongoose = require("mongoose");

const qrSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  facultyEmail: { type: String, required: true },
  expiresAt: { type: Date, required: true }
}, {
  timestamps: true
});

const QrSession = mongoose.model("QrSession", qrSessionSchema);

module.exports = QrSession;
