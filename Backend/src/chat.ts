import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Gets a chat completion response from OpenAI API
 * 
 * @param prompt - The user's message/prompt to send to the AI
 * @returns The AI's response as a string
 * @throws Error if the OpenAI API call fails
 */
export async function getChatCompletion(prompt: string): Promise<string> {
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",  // Common and cost-effective model
      messages: [{ role: "user", content: prompt }],
    });

    return chatCompletion.choices[0]?.message?.content ?? "No reply from AI";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}