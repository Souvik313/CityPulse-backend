import { Router } from "express";
import { analyzeChatSentiment } from "../controllers/sentiment.controller.js";
const sentimentRouter = Router();

sentimentRouter.post("/analyze" , analyzeChatSentiment);
export default sentimentRouter;