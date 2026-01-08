import axios from "axios";
import AppError from "../utils/AppError.js";

/**
 * Fetch live traffic data from TomTom Traffic Flow API
 * @param {Object} params
 * @param {string} params.city
 * @param {number} params.lat
 * @param {number} params.lon
 * @param {number} params.radius
 */
export const fetchLiveTraffic = async ({ city, lat, lon, radius }) => {
  try {
    const API_KEY = process.env.TOMTOM_API_KEY;

    if (!API_KEY) {
      throw new AppError("Traffic API key not configured", 500);
    }

    const response = await axios.get(
      "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json",
      {
        params: {
          point: `${lat},${lon}`,
          radius,
          key: API_KEY
        },
        timeout: 5000
      }
    );

    const data = response.data;

    if (!data || !data.flowSegmentData) {
      throw new AppError("Invalid traffic data received", 502);
    }

    const flow = data.flowSegmentData;

    return {
      city,
      congestionLevel: calculateCongestion(flow.currentSpeed, flow.freeFlowSpeed),
      averageSpeed: flow.currentSpeed,
      travelTimeIndex: flow.freeFlowTravelTime > 0
        ? flow.currentTravelTime / flow.freeFlowTravelTime
        : null,
      roadClosureCount: flow.roadClosure ? 1 : 0,
      incidents: [],
      source: "tomtom"
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Failed to fetch live traffic data",
      503
    );
  }
};

/**
 * Determine congestion level using speed comparison
 */
const calculateCongestion = (currentSpeed, freeFlowSpeed) => {
  if (!currentSpeed || !freeFlowSpeed) return "unknown";

  const ratio = currentSpeed / freeFlowSpeed;

  if (ratio > 0.8) return "Low";
  if (ratio > 0.5) return "Moderate";
  if (ratio > 0.3) return "High";
  return "Severe";
};