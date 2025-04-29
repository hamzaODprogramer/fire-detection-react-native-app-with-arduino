import express from 'express' 
import ffmpeg from 'fluent-ffmpeg'
const app = express()
const port = 3001

app.get("/start_recording", (req, res) => {
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

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});