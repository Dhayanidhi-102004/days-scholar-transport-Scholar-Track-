const mongoose = require('mongoose');

const BusSchema = new mongoose.Schema({
  busNo: String,
  driver: String,
  conductor: String,
  totalSeats: Number,
  seatsAllocated: Number,
  vacancy: Number
});

const RouteSchema = new mongoose.Schema({
  routeNo: String,
  from: String,
  to: String,
  coordinates: {
    from: {
      lat: Number,
      lng: Number
    },
    to: {
      lat: Number,
      lng: Number
    }
  },
  buses: [BusSchema]
});

module.exports = mongoose.model('TransportRoute', RouteSchema);
