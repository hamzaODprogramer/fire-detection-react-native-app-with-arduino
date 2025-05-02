from flask import Flask, request, send_file, jsonify
import os
import uuid
import cv2
from model import process_video
import time
from dotenv import load_dotenv
load_dotenv() 
port = os.getenv("FLASK_SERVER_PORT")

app = Flask(__name__)

# Create directories if they don't exist
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

@app.route('/start_recording', methods=['POST'])
def start_recording():
    try:
        duration = request.json.get('duration', 10000)  # Default to 10 seconds
        print(f"Starting recording for {duration/1000} seconds")
        # Here you would implement the actual recording logic
        time.sleep(duration/1000)  # Simulate recording time
        return jsonify({"success": True, "message": "Recording completed"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

@app.route('/handle_video', methods=['POST'])
def handle_video():
    if 'video' not in request.files:
        return jsonify({"success": False, "message": "No video file provided"}), 400
    
    video_file = request.files['video']
    video_id = str(uuid.uuid4())
    
    # Save the uploaded video
    input_path = os.path.join(UPLOAD_FOLDER, f"{video_id}.mp4")
    video_file.save(input_path)
    
    # Get video duration before processing
    cap = cv2.VideoCapture('recordings/latest.mp4')
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = frame_count / fps if fps > 0 else 0
    cap.release()
    
    # Process the video
    output_path = os.path.join(PROCESSED_FOLDER, f"{video_id}_processed.mp4")
    status = process_video(input_path, output_path)
    print("status : ",status)
    return jsonify({
        "status" : status,
        "success": True,
        "video_id": video_id,
        "duration": duration
    })

@app.route('/get_handled_video/<video_id>')
def get_handled_video(video_id):
    video_path = os.path.join(PROCESSED_FOLDER, f"{video_id}_processed.mp4")
    if not os.path.exists(video_path):
        return jsonify({"success": False, "message": "Video not found"}), 404
    
    # return send_file(video_path, mimetype='video/mp4')
    return send_file(
            video_path,
            mimetype='video/mp4',
            as_attachment=False,
            conditional=True,
            etag=True
        )

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port, debug=True) 