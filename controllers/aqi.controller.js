import AQIData from "../models/AQI.model.js";
import { fetchLiveAQI } from "../services/aqi.service.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

/**
 * @desc    Fetch live AQI data from public API and store it
 * @route   POST /api/aqi/fetch
 * @access  Public / Internal (cron)
 */
export const fetchAndStoreAQI = catchAsync(async (req, res, next) => {
  const { city, lat, lon } = req.body;

  if (!city || lat === undefined || lon === undefined) {
    return next(
      new AppError("City, latitude and longitude are required", 400)
    );
  }

  // Fetch from external AQI API
  const aqi = await fetchLiveAQI({ city, lat, lon });

  if (!aqi) {
    return next(
      new AppError("Unable to fetch AQI data", 502)
    );
  }

  // Store in MongoDB (time-series collection)
  const aqiRecord = await AQIData.create({
    city,
    coordinates: {
      lat,
      lon
    },
    aqi: aqi.aqi,
    category: aqi.category,
    dominantPollutant: aqi.dominantPollutant,
    pollutants: aqi.pollutants,
    source: aqi.source,
    recordedAt: new Date()
  });

  res.status(201).json({
    status: "success",
    data: aqiRecord
  });
});

/**
 * @desc    Get latest AQI data for a city
 * @route   GET /api/aqi/latest?city=Delhi
 * @access  Public
 */
export const getLatestAQIByCity = catchAsync(async (req, res, next) => {
  const { city } = req.query;

  if (!city) {
    return next(
      new AppError("City query parameter is required", 400)
    );
  }

  const latestAQI = await AQIData.findOne({ city })
    .sort({ recordedAt: -1 });

  if (!latestAQI) {
    return next(
      new AppError("No AQI data found for this city", 404)
    );
  }

  res.status(200).json({
    status: "success",
    data: latestAQI
  });
});

/**
 * @desc    Get AQI history for charts & analytics
 * @route   GET /api/aqi/history?city=Delhi&limit=50
 * @access  Public
 */
export const getAQIHistory = catchAsync(async (req, res, next) => {
  const { city, limit = 50 } = req.query;

  if (!city) {
    return next(
      new AppError("City query parameter is required", 400)
    );
  }

  const history = await AQIData.find({ city })
    .sort({ recordedAt: -1 })
    .limit(Number(limit));

  res.status(200).json({
    status: "success",
    results: history.length,
    data: history
  });
});
