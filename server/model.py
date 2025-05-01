import cv2 as cv
import numpy as np
from collections import deque

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
        self.net = cv.dnn.readNetFromTensorflow(model_path)
        
        # Motion tracking
        self.neck_positions = deque(maxlen=10)
        self.motion_threshold = 10
        self.angle_threshold = 30

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

    def process_frame(self, frame):
        frameHeight, frameWidth = frame.shape[:2]
        
        # Preprocess and run inference
        self.net.setInput(cv.dnn.blobFromImage(frame, 1.0, (self.width, self.height), 
                                             (127.5, 127.5, 127.5), swapRB=True, crop=False))
        out = self.net.forward()
        out = out[:, :19, :, :]

        points = []
        for i in range(len(self.BODY_PARTS)):
            heatMap = out[0, i, :, :]
            _, conf, _, point = cv.minMaxLoc(heatMap)
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
                cv.line(frame, points[idFrom], points[idTo], (0, 255, 0), 3)
                cv.ellipse(frame, points[idFrom], (3, 3), 0, 0, 360, (0, 0, 255), cv.FILLED)
                cv.ellipse(frame, points[idTo], (3, 3), 0, 0, 360, (0, 0, 255), cv.FILLED)

        # Pose and motion analysis
        standing = self.is_standing(points, frameHeight)
        neck = points[self.BODY_PARTS["Neck"]]
        self.neck_positions.append(neck)
        moving = self.is_moving(self.neck_positions, self.motion_threshold)

        # Decision logic
        if standing and moving:
            status = "Safe"
            color = (0, 255, 0)  # Green
        else:
            status = "In Danger"
            color = (0, 0, 255)  # Red

        # Display status
        cv.putText(frame, f"Status: {status}", (10, 50), cv.FONT_HERSHEY_SIMPLEX, 1, color, 2)

        return frame, status

def process_video(input_path, output_path):
    analyzer = PoseAnalyzer()
    
    # Open video
    cap = cv.VideoCapture(input_path)
    if not cap.isOpened():
        raise Exception("Could not open video file")

    # Get video properties
    frameWidth = int(cap.get(cv.CAP_PROP_FRAME_WIDTH))
    frameHeight = int(cap.get(cv.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv.CAP_PROP_FPS)

    # Create output video writer
    fourcc = cv.VideoWriter_fourcc(*'mp4v')
    out = cv.VideoWriter(output_path, fourcc, fps, (frameWidth, frameHeight))

    frame_count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Process frame
        processed_frame, status = analyzer.process_frame(frame)
        out.write(processed_frame)
        frame_count += 1

    # Cleanup
    cap.release()
    out.release() 