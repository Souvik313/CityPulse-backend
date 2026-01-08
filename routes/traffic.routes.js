import { Router } from "express";
import { fetchAndStoreTraffic , getLatestTrafficByCity , getTrafficHistory } from "../controllers/traffic.controller.js";
const trafficRouter = Router();

trafficRouter.post("/fetch" , fetchAndStoreTraffic);
trafficRouter.get("/latest?city=:city" , getLatestTrafficByCity);
trafficRouter.get("/history?city=:city&limit=:limit" , getTrafficHistory);

export default trafficRouter;