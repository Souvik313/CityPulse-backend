import { Router} from "express";
import { startChatSession , sendMessage , endChatSession , getSessionMessages } from "../controllers/chat.controller.js";
const chatRouter = Router();

chatRouter.post("/start" , startChatSession);
chatRouter.post("/message" , sendMessage);
chatRouter.post("/end" , endChatSession);
chatRouter.get("/messages" , getSessionMessages);

export default chatRouter;