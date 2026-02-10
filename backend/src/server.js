const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { matchResumeWithJob } = require("./services/matchService");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post("/api/match", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: "Missing input data" });
    }

    const result = await matchResumeWithJob(resumeText, jobDescription);
    res.json(result);

  } catch (error) {
    console.error("🔥 MATCH ERROR:");
    console.error(error);

    // Check if it's a resume validation error
    if (error.message.includes("Invalid resume format")) {
      return res.status(400).json({
        error: "❌ Invalid resume format. Please upload a proper resume with education, experience, and skills information."
      });
    }

    res.status(500).json({
      error: "AI matching failed",
      message: error.message,
      type: error.name,
    });
  }
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 AI Job Matcher running on port ${PORT}`);
});