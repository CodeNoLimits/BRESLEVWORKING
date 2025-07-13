import { Router } from "express";

const router = Router();
// Temporarily disabled Google TTS to fix startup issue
// const client = new TextToSpeechClient();

router.post("/tts", async (req, res) => {
  // Temporarily disabled Google TTS to fix startup issue
  // Browser TTS is used instead in the frontend
  res.json({ 
    message: "TTS handled by browser speechSynthesis",
    success: true 
  });
});

export { router as ttsRouter };