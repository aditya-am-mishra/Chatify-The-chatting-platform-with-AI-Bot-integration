import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { sendMessageToAI, getAIChatHistory } from "../controllers/aiBot.controller.js";

const router = express.Router();

router.post("/send", protectRoute, sendMessageToAI);
router.get("/history", protectRoute, getAIChatHistory);

export default router;
