import axios from "axios";
import AppError from "../utils/AppError.js";

/**
 * Fetch live weather data from OpenWeatherMap API
 * @param {Object} params
 * @param {string} params.city
 * @param {number} params.lat
 * @param {number} params.lon
 */
export const fetchLiveWeather = async ({ city, lat, lon }) => {
  try {
    const API_KEY = process.env.OPENWEATHER_API_KEY;

    if (!API_KEY) {
      throw new AppError("Weather API key not configured", 500);
    }

    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: "metric"
        },
        timeout: 5000
      }
    );

    const data = response.data;

    if (!data || !data.main) {
      throw new AppError("Invalid weather data received", 502);
    }

    // Normalize response for CityPulse
    return {
      city,
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind?.speed ?? null,
      windDirection: data.wind?.deg ?? null,
      weatherCondition: data.weather?.[0]?.description ?? "unknown",
      visibility: data.visibility ?? null,
      cloudCoverage: data.clouds?.all ?? null,
      source: "openweathermap"
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Failed to fetch live weather data",
      503
    );
  }
};
