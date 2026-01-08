import axios from "axios";
import AppError from "../utils/AppError.js";
/**
 * Fetch live AQI data from World Air Quality Index (WAQI) API
 * @param {Object} params
 * @param {string} params.city
 * @param {number} params.lat
 * @param {number} params.lon
 */
export const fetchLiveAQI = async ({ city, lat, lon }) => {
  try {
    const API_KEY = process.env.WAQI_API_KEY;

    if (!API_KEY) {
      throw new AppError("AQI API key not configured", 500);
    }

    const response = await axios.get(
      "https://api.waqi.info/feed/geo:" + lat + ";" + lon + "/",
      {
        params: {
          token: API_KEY
        },
        timeout: 5000
      }
    );

    const data = response.data;

    if (!data || data.status !== "ok") {
      throw new AppError("Invalid AQI data received", 502);
    }

    const iaqi = data.data.iaqi || {};

    return {
      city,
      aqi: data.data.aqi,
      category: getAQICategory(data.data.aqi),
      dominantPollutant: data.data.dominentpol || null,
      pollutants: {
        pm25: iaqi.pm25?.v ?? null,
        pm10: iaqi.pm10?.v ?? null,
        no2: iaqi.no2?.v ?? null,
        so2: iaqi.so2?.v ?? null,
        o3: iaqi.o3?.v ?? null,
        co: iaqi.co?.v ?? null
      },
      source: "waqi"
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Failed to fetch live AQI data",
      503
    );
  }
};

/**
 * Convert AQI value to human-readable category
 */
const getAQICategory = (aqi) => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};
