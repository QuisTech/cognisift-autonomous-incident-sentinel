import { GoogleGenerativeAI } from '@google/generative-ai';

// Access your API key (see "Set up your API key" above)
const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  console.warn('GOOGLE_API_KEY is not set. Gemini API calls will fail.');
}

// Initializes the Google Generative AI client
export const genAI = new GoogleGenerativeAI(API_KEY || '');

// For a specific model, e.g., Gemini 1.5 Pro with long context
export const getGeminiModel = (modelName: string = 'gemini-1.5-pro-latest') => {
  if (!API_KEY) {
    throw new Error('Google API Key is not configured. Please set GOOGLE_API_KEY in your .env file.');
  }
  return genAI.getGenerativeModel({ model: modelName });
};

// Example usage (for reference, would be used within agent logic):
/*
async function runGeminiExample() {
  try {
    const model = getGeminiModel();
    const prompt = "Analyze the following incident data and provide a concise summary:
    [Insert large incident data here]";

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log(text);
    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}
*/
