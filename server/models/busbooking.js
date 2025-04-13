const mongoose = require("mongoose");

const BusBookingSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    busSource: {
        type: String,
        required: true
    },
    bookedAt: {
        type: Date,
        default: Date.now
    }
});

const BusBookingModel = mongoose.model("busBookings", BusBookingSchema);
module.exports = BusBookingModel;
