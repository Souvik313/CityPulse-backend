import ChatSession from "../models/ChatSession.model.js";
import ChatMessage from "../models/ChatMessage.model.js";
import SentimentRecord from "../models/SentimentRecord.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { analyzeSentiment } from "../services/sentiment.service.js";

// Start a new chat session controller
export const startChatSession = catchAsync(async (req, res, next) => {
  const { cityId, sessionId } = req.body;

  if (!cityId || !sessionId) {
    return next(new AppError("cityId and sessionId are required", 400));
  }

  const existingSession = await ChatSession.findOne({
    sessionId,
    status: "active"
  });
  if (existingSession) {
    return res.status(200).json({
      success: true,
      data: existingSession
    });
  }
  const session = await ChatSession.create({
    city: cityId,
    sessionId
  });
  res.status(201).json({
    success: true,
    data: session
  });
});

// Send chat message controller
export const sendMessage = catchAsync(async (req, res, next) => {
  const { sessionId, message, role = "user" } = req.body;

  if (!sessionId || !message) {
    return next(new AppError("sessionId and message are required", 400));
  }

  const session = await ChatSession.findOne({
    sessionId,
    status: "active"
  });

  if (!session) {
    return next(new AppError("Active chat session not found", 404));
  }

  // Save chat message
  const chatMessage = await ChatMessage.create({
    session: session._id,
    city: session.city,
    role,
    content: message
  });
  session.messageCount += 1;
  await session.save();

  let sentimentResult = null;

  if (role === "user" && message.length >= 5) {
    sentimentResult = await analyzeSentiment(message);

    if (sentimentResult && sentimentResult.confidence >= 0.6) {
      await SentimentRecord.create({
        city: session.city,
        session: session._id,
        source: "chatbot",
        topic: sentimentResult.topic,
        score: sentimentResult.score,
        emotion: sentimentResult.emotion,
        confidence: sentimentResult.confidence
      });
    }
  }
  res.status(201).json({
    success: true,
    data: {
      message: chatMessage,
      sentiment: sentimentResult
    }
  });
});

// End chat session controller
export const endChatSession = catchAsync(async (req, res, next) => {
  const { sessionId } = req.body;

  const session = await ChatSession.findOne({
    sessionId,
    status: "active"
  });

  if (!session) {
    return next(new AppError("Active session not found", 404));
  }

  session.status = "ended";
  session.endedAt = new Date();

  await session.save();

  res.status(200).json({
    success: true,
    message: "Chat session ended successfully"
  });
});

// Get chat session messages controller
export const getSessionMessages = catchAsync(async (req, res, next) => {
  const { sessionId } = req.query;
  if(!sessionId){
    return next(new AppError("sessionId query parameter is required", 400));
  }

  const session = await ChatSession.findById(sessionId);

  if (!session) {
    return next(new AppError("Session not found", 404));
  }

  const messages = await ChatMessage.find({
    session: session._id
  }).sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    results: messages.length,
    data: messages
  });
});
