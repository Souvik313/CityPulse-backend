import ChatMessage from "../models/ChatMessage.model.js";
import ChatSession from "../models/ChatSession.model.js";
import SentimentRecord from "../models/SentimentRecord.model.js";
import { analyzeSentiment } from "../services/sentiment.service.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

export const analyzeChatSentiment = catchAsync(async (req, res, next) => {
  const { messageId } = req.body;

  if (!messageId) {
    return next(
      new AppError("Message ID is required for sentiment analysis", 400)
    );
  }

  const message = await ChatMessage.findById(messageId)
    .populate("session");

  if (!message) {
    return next(
      new AppError("Chat message not found", 404)
    );
  }

  const sentimentResult = await analyzeSentiment(message.content);

  const sentimentRecord = await SentimentRecord.create({
    city: message.session.city,
    session: message.session._id,
    message: message._id,
    sentiment: sentimentResult.sentiment,
    confidence: sentimentResult.confidence,
    source: "chat"
  });
  message.sentiment = sentimentRecord._id;
  await message.save();

  res.status(201).json({
    status: "success",
    data: {
      messageId: message._id,
      sentiment: sentimentRecord.sentiment,
      confidence: sentimentRecord.confidence
    }
  });
});
