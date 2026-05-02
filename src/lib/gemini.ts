import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard, QuizQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function* explainTopicStream(topic: string) {
  const response = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: `Explain the following topic or notes in a simple, engaging, and structured way for a student: \n\n${topic}`,
    config: {
      systemInstruction: "You are an expert AI Study Coach. Your goal is to explain complex topics simply and clearly using Markdown formatting. Use bullet points, bold text, and headers where appropriate.",
    },
  });

  for await (const chunk of response) {
    yield chunk.text;
  }
}

export async function generateFlashcards(topic: string): Promise<Flashcard[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create 10 high-quality flashcards for studying the following topic: \n\n${topic}`,
    config: {
      systemInstruction: "Generate exactly 10 flashcards. Each card should have a 'front' (question/term) and a 'back' (answer/definition).",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            front: { type: Type.STRING },
            back: { type: Type.STRING },
          },
          required: ["front", "back"],
        },
      },
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse flashcards", e);
    return [];
  }
}

export async function generateQuiz(topic: string): Promise<QuizQuestion[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a 5-question multiple choice quiz for the following topic: \n\n${topic}`,
    config: {
      systemInstruction: "Generate exactly 5 multiple choice questions. Each question should have 4 options and the index of the correct answer (0-3).",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            correctAnswer: { type: Type.INTEGER },
          },
          required: ["question", "options", "correctAnswer"],
        },
      },
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse quiz", e);
    return [];
  }
}
