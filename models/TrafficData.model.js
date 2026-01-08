import mongoose from "mongoose";

const trafficSchema = new mongoose.Schema({
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "City",
        required: true,
        index: true
    },
    source: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DataSource",
        required: true
    },
    congestion: {
        level: Number,
        category: String
    },
    speed: {
        average: Number,
        freeFlow: Number
    },
    incidents: {
        count: Number,
        types: [String]
    },
    hotspots: [
      {
        lat: Number,
        lng: Number,
        severity: Number
      }
    ],
    recordedAt: {
      type: Date,
      required: true,
      index: true
    },
    ingestionMeta: {
      fetchedAt: Date,
      apiLatencyMs: Number,
      confidence: Number
    }
  }, {timestamps: false});

trafficSchema.index({city:1, recordedAt: -1});

const TrafficData = new mongoose.model("TrafficData", trafficSchema , "trafficdata");
export default TrafficData;