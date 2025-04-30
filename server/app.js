const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

let isRecording = false;

// Endpoint to start recording
app.get("/start_recording", (req, res) => {
  if (isRecording) {
    return res.status(409).json({ 
      error: true, 
      message: "⚠️ Déjà en cours d'enregistrement, veuillez patienter..." 
    });
  }

  isRecording = true;

  const streamUrl = "https://45ad-105-74-67-170.ngrok-free.app/stream";
  const outputDir = path.join(__dirname, "recordings");
  const outputPath = path.join(outputDir, "latest.mp4");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log("⏺️ Démarrage de l'enregistrement de 3 secondes...");

  ffmpeg(streamUrl)
    .inputFormat('mjpeg')
    .duration(3)
    .outputOptions([
      "-c:v libx264",
      "-preset ultrafast",
      "-pix_fmt yuv420p"
    ])
    .on("end", () => {
      console.log("✅ Enregistrement terminé.");
      isRecording = false;
    })
    .on("error", (err) => {
      console.error("❌ Erreur pendant l'enregistrement:", err.message);
      isRecording = false;
    })
    .save(outputPath);

  res.json({ 
    success: true, 
    message: "🎥 Enregistrement lancé pour 3 secondes." 
  });
});

// New endpoint to check recording status - now properly sending JSON
app.get("/recording_status", (req, res) => {
  // Set proper content type header
  res.setHeader('Content-Type', 'application/json');
  // Return JSON response
  res.json({ isRecording });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${port}`);
});