import { generateAIResponse } from "../lib/gemini.js";
import Message from "../models/Message.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// AI Bot User ID (fixed)
const AI_BOT_ID = "000000000000000000000001";

export const sendMessageToAI = async (req, res) => {
  try {
    const { text } = req.body;
    const senderId = req.user._id;

    if (!text) {
      return res.status(400).json({ message: "Message text is required" });
    }

    // Save user's message to AI bot
    const userMessage = new Message({
      senderId,
      receiverId: AI_BOT_ID,
      text,
    });
    await userMessage.save();

    // Generate AI response
    const aiResponseText = await generateAIResponse(text);

    // Save AI's response
    const aiMessage = new Message({
      senderId: AI_BOT_ID,
      receiverId: senderId,
      text: aiResponseText,
    });
    await aiMessage.save();

    // Send AI response via socket
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", aiMessage);
    }

    res.status(201).json({ userMessage, aiMessage });
  } catch (error) {
    console.error("Error in sendMessageToAI:", error);
    res.status(500).json({ message: "Failed to get AI response" });
  }
};

export const getAIChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: AI_BOT_ID },
        { senderId: AI_BOT_ID, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getAIChatHistory:", error);
    res.status(500).json({ message: "Failed to get chat history" });
  }
};
