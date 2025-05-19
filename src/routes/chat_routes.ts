import express from "express";
import { getChatCompletion } from "../chat"; // בדוק שהנתיב נכון בהתאם למבנה הפרויקט שלך

const router = express.Router();

router.post("/", async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Missing prompt" });
      return;
    }

    const response = await getChatCompletion(prompt);
    res.json({ reply: response });  // מפתח 'reply' תואם ל־frontend
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
