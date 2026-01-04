import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/analyze", async (req, res) => {
  const text = req.body.text;

  // prevent empty input
  if (!text || text.trim() === "") {
    return res.json({
      sentiment: "Neutral",
      emoji: "😐",
      confidence: 0
    });
  }

  try {
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: text })
      }
    );

    const data = await response.json();

    // model still loading
    if (data.error && data.error.toLowerCase().includes("loading")) {
      return res.json({
        sentiment: "Model loading",
        emoji: "⏳",
        confidence: 0
      });
    }

    // pick best confidence
    const best = data[0].reduce((a, b) =>
      a.score > b.score ? a : b
    );

    let sentiment = "Neutral";
    let emoji = "😐";

    // label mapping
    if (best.label === "LABEL_2" || best.label === "positive") {
      sentiment = "Positive";
      emoji = "😄";
    }
    else if (best.label === "LABEL_0" || best.label === "negative") {
      sentiment = "Negative";
      emoji = "😞";
    }

    res.json({
      sentiment,
      emoji,
      confidence: best.score
    });

  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({
      sentiment: "Error",
      emoji: "⚠️",
      confidence: 0
    });
  }
});

app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});