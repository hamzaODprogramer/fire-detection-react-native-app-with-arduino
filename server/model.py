from flask import Flask, request, send_file, jsonify
import os
import uuid
import cv2
import numpy as np
from collections import deque
import time
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# Create directories if they don't exist
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

# PoseAnalyzer class with fixed decision logic
class PoseAnalyzer:
    def __init__(self, model_path="graph_opt.pb", threshold=0.2, width=368, height=368):
        self.threshold = threshold
        self.width = width
        self.height = height
        
        # Body parts and pose pairs
        self.BODY_PARTS = { "Nose": 0, "Neck": 1, "RShoulder": 2, "RElbow": 3, "RWrist": 4,
                          "LShoulder": 5, "LElbow": 6, "LWrist": 7, "RHip": 8, "RKnee": 9,
                          "RAnkle": 10, "LHip": 11, "LKnee": 12, "LAnkle": 13, "REye": 14,
                          "LEye": 15, "REar": 16, "LEar": 17, "Background": 18 }

        self.POSE_PAIRS = [ ["Neck", "RShoulder"], ["Neck", "LShoulder"], ["RShoulder", "RElbow"],
                          ["RElbow", "RWrist"], ["LShoulder", "LElbow"], ["LElbow", "LWrist"],
                          ["Neck", "RHip"], ["RHip", "RKnee"], ["RKnee", "RAnkle"], ["Neck", "LHip"],
                          ["LHip", "LKnee"], ["LKnee", "LAnkle"], ["Neck", "Nose"], ["Nose", "REye"],
                          ["REye", "REar"], ["Nose", "LEye"], ["LEye", "LEar"] ]

        # Load the model
        try:
            self.net = cv2.dnn.readNetFromTensorflow(model_path)
            logger.info(f"Successfully loaded model from {model_path}")
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise
        
        # Motion tracking
        self.neck_positions = deque(maxlen=10)
        self.motion_threshold = 10
        
        # Increasing angle threshold to better detect running postures
        self.angle_threshold = 45  # Increased from 30 to 45 degrees

    def is_standing(self, points, frame_height):
        neck = points[self.BODY_PARTS["Neck"]]
        lhip = points[self.BODY_PARTS["LHip"]]
        rhip = points[self.BODY_PARTS["RHip"]]

        if neck and (lhip or rhip):
            hip = lhip if lhip else rhip
            if lhip and rhip:
                hip = ((lhip[0] + rhip[0]) // 2, (lhip[1] + rhip[1]) // 2)

            dy = hip[1] - neck[1]
            dx = hip[0] - neck[0]
            angle = np.abs(np.arctan2(dx, dy) * 180 / np.pi)

            hip_y = hip[1]
            is_high = hip_y < frame_height * 0.75

            return angle < self.angle_threshold and is_high
        return False

    def is_moving(self, neck_positions, threshold):
        if len(neck_positions) < 2:
            return False
        displacements = []
        for i in range(1, len(neck_positions)):
            prev, curr = neck_positions[i-1], neck_positions[i]
            if prev and curr:
                disp = np.sqrt((curr[0] - prev[0])**2 + (curr[1] - prev[1])**2)
                displacements.append(disp)
        return max(displacements) > threshold if displacements else False
    
    def is_running(self, points):
        """Detect running posture based on knee positions and angles"""
        lknee = points[self.BODY_PARTS["LKnee"]]
        rknee = points[self.BODY_PARTS["RKnee"]]
        lankle = points[self.BODY_PARTS["LAnkle"]]
        rankle = points[self.BODY_PARTS["RAnkle"]]
        lhip = points[self.BODY_PARTS["LHip"]]
        rhip = points[self.BODY_PARTS["RHip"]]
        
        # Check if we have the necessary points
        if (lknee and lankle and lhip) or (rknee and rankle and rhip):
            # Check if at least one leg is bent (typical in running)
            knee_bent = False
            
            if lknee and lankle and lhip:
                # Calculate leg bend angle for left leg
                v1 = np.array([lhip[0] - lknee[0], lhip[1] - lknee[1]])
                v2 = np.array([lankle[0] - lknee[0], lankle[1] - lknee[1]])
                
                # Normalize vectors
                v1_norm = v1 / np.linalg.norm(v1) if np.linalg.norm(v1) > 0 else v1
                v2_norm = v2 / np.linalg.norm(v2) if np.linalg.norm(v2) > 0 else v2
                
                # Calculate angle
                dot_product = np.dot(v1_norm, v2_norm)
                dot_product = max(-1.0, min(1.0, dot_product))  # Clamp to [-1, 1]
                angle = np.arccos(dot_product) * 180 / np.pi
                
                knee_bent = angle > 30  # A bent knee typically has an angle > 30 degrees
            
            if not knee_bent and rknee and rankle and rhip:
                # Calculate leg bend angle for right leg
                v1 = np.array([rhip[0] - rknee[0], rhip[1] - rknee[1]])
                v2 = np.array([rankle[0] - rknee[0], rankle[1] - rknee[1]])
                
                # Normalize vectors
                v1_norm = v1 / np.linalg.norm(v1) if np.linalg.norm(v1) > 0 else v1
                v2_norm = v2 / np.linalg.norm(v2) if np.linalg.norm(v2) > 0 else v2
                
                # Calculate angle
                dot_product = np.dot(v1_norm, v2_norm)
                dot_product = max(-1.0, min(1.0, dot_product))  # Clamp to [-1, 1]
                angle = np.arccos(dot_product) * 180 / np.pi
                
                knee_bent = angle > 30  # A bent knee typically has an angle > 30 degrees
            
            return knee_bent
            
        return False

    def process_frame(self, frame):
        frameHeight, frameWidth = frame.shape[:2]
        
        # Preprocess and run inference
        self.net.setInput(cv2.dnn.blobFromImage(frame, 1.0, (self.width, self.height), 
                                              (127.5, 127.5, 127.5), swapRB=True, crop=False))
        out = self.net.forward()
        out = out[:, :19, :, :]

        points = []
        for i in range(len(self.BODY_PARTS)):
            heatMap = out[0, i, :, :]
            _, conf, _, point = cv2.minMaxLoc(heatMap)
            x = (frameWidth * point[0]) / out.shape[3]
            y = (frameHeight * point[1]) / out.shape[2]
            points.append((int(x), int(y)) if conf > self.threshold else None)

        # Draw pose
        for pair in self.POSE_PAIRS:
            partFrom = pair[0]
            partTo = pair[1]
            idFrom = self.BODY_PARTS[partFrom]
            idTo = self.BODY_PARTS[partTo]
            if points[idFrom] and points[idTo]:
                cv2.line(frame, points[idFrom], points[idTo], (0, 255, 0), 3)
                cv2.ellipse(frame, points[idFrom], (3, 3), 0, 0, 360, (0, 0, 255), cv2.FILLED)
                cv2.ellipse(frame, points[idTo], (3, 3), 0, 0, 360, (0, 0, 255), cv2.FILLED)

        # Pose and motion analysis
        standing = self.is_standing(points, frameHeight)
        running = self.is_running(points)
        neck = points[self.BODY_PARTS["Neck"]]
        self.neck_positions.append(neck)
        moving = self.is_moving(self.neck_positions, self.motion_threshold)

        # FIXED DECISION LOGIC: Person is safe if they are standing OR moving OR running
        if standing or moving or running:
            status = "Safe"
            color = (0, 255, 0)  # Green
        else:
            status = "InDanger"
            color = (0, 0, 255)  # Red

        # Display status and details
        cv2.putText(frame, f"Status: {status}", (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
        
        # Optional: Add debug info
        y_pos = 90
        if standing:
            cv2.putText(frame, "Standing: Yes", (10, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            y_pos += 30
        if moving:
            cv2.putText(frame, "Moving: Yes", (10, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            y_pos += 30
        if running:
            cv2.putText(frame, "Running: Yes", (10, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        return frame, status

def process_video(input_path, output_path, skip_frames=2):
    """Process a video file with pose analysis and frame skipping"""
    logger.info(f"Processing video from {input_path} to {output_path} with skip_frames={skip_frames}")
    
    model_path = "graph_opt.pb"
    if not os.path.exists(model_path):
        logger.error(f"Model file not found at {model_path}")
        raise FileNotFoundError(f"Model file not found at {model_path}")
    
    try:
        analyzer = PoseAnalyzer(model_path=model_path)
        
        cap = cv2.VideoCapture(input_path)
        if not cap.isOpened():
            raise Exception(f"Could not open video file: {input_path}")

        frameWidth = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frameHeight = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        logger.info(f"Video properties: {frameWidth}x{frameHeight} @ {fps}fps")

        fourcc = cv2.VideoWriter_fourcc(*'avc1')
        out = cv2.VideoWriter(output_path, fourcc, fps / skip_frames, (frameWidth, frameHeight))

        if not out.isOpened():
            raise Exception(f"Could not create output video file: {output_path}")

        frame_count = 0
        processed_count = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_count % skip_frames == 0:
                resize_factor = 0.5  # 50% of original resolution
                small_frame = cv2.resize(frame, (0, 0), fx=resize_factor, fy=resize_factor)
                processed_small_frame, status = analyzer.process_frame(small_frame)
                processed_frame = cv2.resize(processed_small_frame, (frameWidth, frameHeight))

                out.write(processed_frame)
                processed_count += 1

                if processed_count % 30 == 0:
                    logger.info(f"Processed {processed_count} frames")

            frame_count += 1

        cap.release()
        out.release()

        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            raise Exception(f"Output file is missing or empty: {output_path}")

        logger.info(f"Video processing complete. Total processed frames: {processed_count}")
        return status
    except Exception as e:
        logger.error(f"Error in video processing: {str(e)}")
        raise
