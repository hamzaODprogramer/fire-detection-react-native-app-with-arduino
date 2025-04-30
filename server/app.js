const express = require('express')
const ffmpeg = require('fluent-ffmpeg')
const cors = require('cors')
const app = express()
const port = 3001

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));


app.use(express.json())

app.get("/start_recording", (req, res) => {
    console.log("Starting recording...");
    const streamUrl = "http://192.168.1.143:81/stream"
    const outputPath = "recordings/latest.mp4"

    ffmpeg(streamUrl)
    .outputOptions("-t", "30") 
    .on("end", () => {
      console.log("Recording complete.");
    })
    .on("error", (err) => {
      console.error("Recording error:", err);
    })
    .save(outputPath);

    res.send("OK");
    
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
