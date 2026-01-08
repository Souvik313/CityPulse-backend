import WeatherData from "../models/WeatherData.model.js";
import { fetchLiveWeather } from "../services/weather.service.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

export const fetchAndStoreWeather = catchAsync(async (req, res, next) => {
  const { city, lat, lon } = req.body;

  if (!city || lat === undefined || lon === undefined) {
    return next(
      new AppError("City, latitude and longitude are required", 400)
    );
  }

  // Fetch from external API
  const weather = await fetchLiveWeather({ city, lat, lon });

  if (!weather) {
    return next(
      new AppError("Unable to fetch weather data", 502)
    );
  }

  // Store in MongoDB (time-series collection)
  const weatherRecord = await WeatherData.create({
    city,
    coordinates: {
      lat,
      lon
    },
    temperature: weather.temperature,
    feelsLike: weather.feelsLike,
    humidity: weather.humidity,
    pressure: weather.pressure,
    windSpeed: weather.windSpeed,
    windDirection: weather.windDirection,
    weatherCondition: weather.weatherCondition,
    visibility: weather.visibility,
    cloudCoverage: weather.cloudCoverage,
    source: weather.source,
    recordedAt: new Date()
  });

  res.status(201).json({
    status: "success",
    data: weatherRecord
  });
});

export const getLatestWeatherByCity = catchAsync(async (req, res, next) => {
  const { city } = req.query;

  if (!city) {
    return next(
      new AppError("City query parameter is required", 400)
    );
  }

  const latestWeather = await WeatherData.findOne({ city })
    .sort({ recordedAt: -1 });

  if (!latestWeather) {
    return next(
      new AppError("No weather data found for this city", 404)
    );
  }

  res.status(200).json({
    status: "success",
    data: latestWeather
  });
});

export const getWeatherHistory = catchAsync(async (req, res, next) => {
  const { city, limit = 50 } = req.query;

  if (!city) {
    return next(
      new AppError("City query parameter is required", 400)
    );
  }

  const history = await WeatherData.find({ city })
    .sort({ recordedAt: -1 })
    .limit(Number(limit));

  res.status(200).json({
    status: "success",
    results: history.length,
    data: history
  });
});
