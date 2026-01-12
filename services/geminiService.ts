import { GoogleGenAI } from "@google/genai";
import { BookData, CalculationResult } from "../types";

// Initialize with strictly required format as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMotivation = async (
  bookData: BookData, 
  stats: CalculationResult
): Promise<string> => {
  const prompt = `
    I am reading the book "${bookData.title || 'Unknown Title'}".
    Here are my stats:
    - Current Page: ${bookData.currentPage}
    - Total Pages: ${bookData.totalPages}
    - Pages Remaining: ${stats.pagesRemaining}
    - Days Remaining: ${stats.daysRemaining}
    - Target Pace: ${stats.pagesPerDay} pages/day

    Please provide a short, motivating, and witty response (max 3 sentences).
    1. Acknowledge the pace (is it easy or intense?).
    2. Give a specific reason to keep reading this genre/book (if title is known, be specific but NO SPOILERS).
    3. End with an encouraging call to action.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
      }
    });

    return response.text || "Keep reading! You can do this.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Keep going! You're making progress every day.";
  }
};