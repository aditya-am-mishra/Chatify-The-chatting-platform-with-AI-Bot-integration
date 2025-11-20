import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "./env.js";

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);

export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
};

export const generateAIResponse = async (message, retries = 3) => {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating AI response:", error.message);
    
    // If service is overloaded and we have retries left, try again after a delay
    if (error.status === 503 && retries > 0) {
      console.log(`Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return generateAIResponse(message, retries - 1);
    }
    
    // If all retries failed or different error, return friendly message
    if (error.status === 503) {
      return "I'm experiencing high traffic right now. Please try again in a moment! 🤖";
    }
    
    throw error;
  }
};
