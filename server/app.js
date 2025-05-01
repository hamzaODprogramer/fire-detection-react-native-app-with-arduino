const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

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
let lastProcessedVideoId = null;

// Configuration
const RECORDING_DURATION = 10000; // 10 seconds recording
const PROCESSING_INTERVAL = 2000; // 2 seconds processing interval
const FLASK_SERVER_URL = 'http://192.168.100.184:5001';

// Endpoint to start recording
app.get("/start_recording", async (req, res) => {
  if (isRecording) {
    return res.status(409).json({ 
      error: true, 
      message: "⚠️ Déjà en cours d'enregistrement, veuillez patienter..." 
    });
  }

  isRecording = true;

  const streamUrl = "https://865e-105-74-67-203.ngrok-free.app/stream";
  const outputDir = path.join(__dirname, "recordings");
  const outputPath = path.join(outputDir, "latest.mp4");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log("⏺️ Démarrage de l'enregistrement de 10 secondes...");

  ffmpeg(streamUrl)
    .inputFormat('mjpeg')
    .duration(RECORDING_DURATION / 1000) // Convert to seconds
    .outputOptions([
      "-c:v libx264",
      "-preset ultrafast",
      "-pix_fmt yuv420p",
      "-r 30", // Set frame rate to 30fps
      "-g 30", // Set keyframe interval
      "-b:v 2M", // Set video bitrate
      "-maxrate 2M",
      "-bufsize 1M"
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
    message: `🎥 Enregistrement lancé pour ${RECORDING_DURATION/1000} secondes.` 
  });
});

// New endpoint to analyze video
app.get("/analyze_video", async (req, res) => {
  try {
    // Simulate longer processing time
    await new Promise(resolve => setTimeout(resolve, PROCESSING_INTERVAL));
    
    // Get the latest recorded video
    const videoPath = path.join(__dirname, "recordings", "latest.mp4");
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        message: "No video found to analyze"
      });
    }

    // Create form data
    const formData = new FormData();
    formData.append('video', fs.createReadStream(videoPath));

    // Send to Flask server
    const response = await axios.post(`${FLASK_SERVER_URL}/handle_video`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    if (response.data.success) {
      lastProcessedVideoId = response.data.video_id;
      res.json({
        success: true,
        video_id: response.data.video_id,
        duration: response.data.duration
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error processing video"
      });
    }
  } catch (error) {
    console.error('Error analyzing video:', error);
    res.status(500).json({ success: false, message: 'Error analyzing video' });
  }
});

// Endpoint to get analyzed video
app.get("/get_analyzed_video", async (req, res) => {
  if (!lastProcessedVideoId) {
    return res.status(404).json({
      error: true,
      message: "❌ Aucune vidéo analysée trouvée"
    });
  }

  try {
    const response = await axios.get(`${FLASK_SERVER_URL}/get_handled_video/${lastProcessedVideoId}`, {
      responseType: 'stream'
    });

    res.setHeader('Content-Type', 'video/mp4');
    response.data.pipe(res);
  } catch (error) {
    console.error("Error getting analyzed video:", error);
    return res.status(500).json({
      error: true,
      message: "❌ Erreur lors de la récupération de la vidéo analysée"
    });
  }
});

// Endpoint to check recording status
app.get("/recording_status", (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({ isRecording });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${port}`);
});