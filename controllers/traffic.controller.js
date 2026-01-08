import TrafficData from "../models/TrafficData.model.js";
import { fetchLiveTraffic } from "../services/traffic.service.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

export const fetchAndStoreTraffic = catchAsync(async (req, res, next) => {
  const { city, lat, lon, radius = 5000 } = req.body;

  if (!city || lat === undefined || lon === undefined) {
    return next(
      new AppError("City, latitude and longitude are required", 400)
    );
  }

  // Fetch from external traffic API
  const traffic = await fetchLiveTraffic({ city, lat, lon, radius });

  if (!traffic) {
    return next(
      new AppError("Unable to fetch traffic data", 502)
    );
  }

  // Store traffic snapshot
  const trafficRecord = await TrafficData.create({
    city,
    coordinates: {
      lat,
      lon
    },
    congestionLevel: traffic.congestionLevel,
    averageSpeed: traffic.averageSpeed,
    travelTimeIndex: traffic.travelTimeIndex,
    roadClosureCount: traffic.roadClosureCount,
    incidents: traffic.incidents,
    source: traffic.source,
    recordedAt: new Date()
  });

  res.status(201).json({
    status: "success",
    data: trafficRecord
  });
});

export const getLatestTrafficByCity = catchAsync(async (req, res, next) => {
  const { city } = req.query;

  if (!city) {
    return next(
      new AppError("City query parameter is required", 400)
    );
  }

  const latestTraffic = await TrafficData.findOne({ city })
    .sort({ recordedAt: -1 });

  if (!latestTraffic) {
    return next(
      new AppError("No traffic data found for this city", 404)
    );
  }

  res.status(200).json({
    status: "success",
    data: latestTraffic
  });
});

export const getTrafficHistory = catchAsync(async (req, res, next) => {
  const { city, limit = 50 } = req.query;

  if (!city) {
    return next(
      new AppError("City query parameter is required", 400)
    );
  }

  const history = await TrafficData.find({ city })
    .sort({ recordedAt: -1 })
    .limit(Number(limit));

  res.status(200).json({
    status: "success",
    results: history.length,
    data: history
  });
});
