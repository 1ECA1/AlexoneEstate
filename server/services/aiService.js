
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is missing from environment variables.");
}

if (!model) {
  throw new Error("OPENAI_MODEL is missing from environment variables.");
}

const openai = new OpenAI({ apiKey });

export const askAI = async (message) => {
  const response = await openai.responses.create({
    model,
    instructions:
      "You are HavenEstate's real estate customer support assistant. " +
      "Be friendly, professional, and concise. " +
      "Do not invent property listings, prices, availability, or company policies. " +
      "If you do not have verified information, say so clearly.",
    input: message,
  });

  return response.output_text;
};
