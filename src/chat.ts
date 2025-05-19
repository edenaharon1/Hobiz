import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getChatCompletion(prompt: string): Promise<string> {
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",  // מודל זול ונפוץ
      messages: [{ role: "user", content: prompt }],
    });

    return chatCompletion.choices[0]?.message?.content ?? "No reply from AI";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}
