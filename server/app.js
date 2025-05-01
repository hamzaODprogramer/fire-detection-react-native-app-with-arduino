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
  try {
    // Start recording
    const response = await axios.post(`${FLASK_SERVER_URL}/start_recording`, {
      duration: RECORDING_DURATION // Send the duration to Flask server
    });
    
    res.json({ success: true, message: 'Recording started' });
  } catch (error) {
    console.error('Error starting recording:', error);
    res.status(500).json({ success: false, message: 'Error starting recording' });
  }
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