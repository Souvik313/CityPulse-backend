import { Router } from "express";
import { fetchAndStoreWeather , getLatestWeatherByCity , getWeatherHistory } from "../controllers/weather.controller.js";
const weatherRouter = Router();

weatherRouter.post("/fetch" , fetchAndStoreWeather);
weatherRouter.get("/latest?city=:city" , getLatestWeatherByCity);
weatherRouter.get("/history?city=:city&limit=:limit" , getWeatherHistory);

export default weatherRouter;