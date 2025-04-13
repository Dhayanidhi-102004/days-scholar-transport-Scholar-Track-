const mongoose = require('mongoose');

const busSubSchema = new mongoose.Schema({
  busNo: {
    type: Number,
    required: true
  },
  driver: {
    type: String,
    required: true
  },
  conductor: {
    type: String,
    required: true
  },
  totalSeats: {
    type: Number,
    required: true
  },
  seatsAllocated: {
    type: Number,
    required: true
  },
  vacancy: {
    type: Number,
    required: true
  }
});

// Coordinates sub-schema for from/to
const coordinateSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  }
});

const busDetailSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  columns: {
    type: Number,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  busRoute: {
    type: String,
    required: true
  },
  from: {
    type: coordinateSchema,
    required: true
  },
  to: {
    type: coordinateSchema,
    required: true
  },
  data: {
    type: Map,
    of: busSubSchema,
    required: true
  }
});

const BusDetailModel = mongoose.model('busdetailsdata', busDetailSchema);

module.exports = BusDetailModel;
