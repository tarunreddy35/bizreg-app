const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch"); // install: npm install node-fetch

const app = express();
const PORT = 5000;

// ✅ Allow CORS
app.use(
    cors({
        origin: "http://localhost:8080", // allow frontend
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
    })
);

app.use(bodyParser.json());

// Hugging Face API config
const HF_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli";
const HF_API_KEY = "YOUR_HF_API_KEY"; // 🔑 put your key here

// Example API route
app.post("/api/query", async (req, res) => {
    try {
        const { query } = req.body;
        console.log("Received query:", query);

        // Send query to Hugging Face
        const response = await fetch(HF_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: query,
            }),
        });

        if (!response.ok) {
            throw new Error(`HuggingFace API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Return Hugging Face response to frontend
        res.json({ rules: data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
