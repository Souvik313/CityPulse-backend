import { Router } from "express";
import { fetchAndStoreAQI, getLatestAQIByCity , getAQIHistory } from "../controllers/aqi.controller.js";

const aqiRouter = Router();
aqiRouter.post("/fetch" , fetchAndStoreAQI);
aqiRouter.get("/latest" , getLatestAQIByCity);
aqiRouter.get("/history" , getAQIHistory);

export default aqiRouter;