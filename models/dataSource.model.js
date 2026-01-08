import mongoose from "mongoose";

const dataSourceSchema = new mongoose.Schema({
    name: {
        enum: ["OpenAQI api", "OpenWeatherMap api", "HERE traffic api", "Chatbot"],
        type: String,
        required: true,
        trim: true
    },
    type: {
        enum: ["api", "sentiment analysis", "user chatbot"],
        type: String,
        required: true,
        trim: true
    },
    reliabilityScore: {
        type: Number,
        min: 0,
        max: 10
    },
    lastFetchedAt: {
        type: Date,
        default: null
    }
}, {timestamps: true});

const DataSource = new mongoose.model("DataSource", dataSourceSchema);
export default DataSource;