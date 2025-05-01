import ButtonFuncs from "@/components/home/ButtonFuncs";
import CardButton from "@/components/home/CardButton";
import OnlineCardState from "@/components/home/OnlineCardState";
import React, { useState, useRef, useEffect } from "react";
import { Text, View, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";

export default function Online() {
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef(null);
  const [webViewUrl, setWebViewUrl] = useState("https://45ad-105-74-67-170.ngrok-free.app/stream");
  
  // States for recording workflow
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [recordingInProgress, setRecordingInProgress] = useState(false);
  const [recordingFinished, setRecordingFinished] = useState(false);
  const [showAnalysePrompt, setShowAnalysePrompt] = useState(false);
  
  // Reference to store the polling interval
  const pollingIntervalRef = useRef(null);
  
  // Server URL configuration - could be moved to environment variables
  const SERVER_URL = "http://100.70.32.50:3001";

  const settingUrlWebView = () => {
    setWebViewUrl('https://45ad-105-74-67-170.ngrok-free.app/stream');
    setIsRecording(false);
    setCountdown(null);
    setRecordingInProgress(false);
    setRecordingFinished(false);
    setShowAnalysePrompt(false);
    
    // Clear any existing polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }
  
  useEffect(() => {
    settingUrlWebView();
    // Cleanup function
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Countdown effect
  useEffect(() => {
    let timer;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCountdown(null);
      // Start the actual recording on the server after countdown
      startRecordingOnServer();
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Start the recording on the server and set up polling
  const startRecordingOnServer = async () => {
    setRecordingInProgress(true);
    
    try {
      // Start the recording on the server
      await fetch(`${SERVER_URL}/start_recording`);
      
      // Start polling for recording status
      startPollingRecordingStatus();
    } catch (error) {
      console.error("Error starting recording:", error);
      // Handle error - reset to original state
      handleRecordingError();
    }
  };
  
  // Handle recording errors
  const handleRecordingError = () => {
    // Clear polling interval if it exists
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // Reset states
    setRecordingInProgress(false);
    settingUrlWebView();
    
    // Optionally show an error message
    alert("Erreur d'enregistrement. Veuillez réessayer.");
  };

  // Polling function to check recording status
  const startPollingRecordingStatus = () => {
    // Clear any existing polling interval first
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    // Counter for polling attempts
    let pollAttempts = 0;
    const MAX_POLL_ATTEMPTS = 20; // 10 seconds with 500ms interval
    
    // Create new polling interval
    pollingIntervalRef.current = setInterval(async () => {
      try {
        console.log("Checking recording status, attempt:", pollAttempts + 1);
        
        const response = await fetch(`${SERVER_URL}/recording_status`);
        
        // Check if response is valid before trying to parse JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.log("Invalid response type:", contentType);
          throw new Error("Server didn't return JSON");
        }
        
        const data = await response.json();
        console.log("Recording status:", data);
        
        if (!data.isRecording) {
          console.log("Recording complete, updating UI");
          // Recording is complete - clean up and update UI
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          
          setRecordingInProgress(false);
          setRecordingFinished(true);
          setShowAnalysePrompt(true);
        }
      } catch (error) {
        console.error("Error checking recording status:", error);
        pollAttempts++;
        
        // Fallback mechanism: assume recording is done after max attempts
        if (pollAttempts >= MAX_POLL_ATTEMPTS) {
          console.log("Max polling attempts reached, assuming recording is complete");
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          
          setRecordingInProgress(false);
          setRecordingFinished(true);
          setShowAnalysePrompt(true);
        }
      }
    }, 500);
  };

  const saveVideo = () => {
    // Start the recording process by initiating countdown
    setIsRecording(true);
    setCountdown(3);
    
    // Hide the WebView content
    setWebViewUrl('about:blank');
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsConnected(false);
    setIsLoading(false);
  };

  const retryConnection = () => {
    setIsLoading(true);
    setIsConnected(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleAnalyse = () => {
    // Reset the recording states and handle analysis
    setIsRecording(false);
    setShowAnalysePrompt(false);
    setRecordingFinished(false);
    
    // Here you can add your analysis logic
    alert("Analyse en cours...");
    
    // Eventually reload the stream
    settingUrlWebView();
  };

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        {isConnected ? (
          <>
            {isRecording ? (
              <View style={styles.recordingOverlay}>
                {countdown !== null ? (
                  <Text style={styles.countdownText}>{countdown}</Text>
                ) : recordingInProgress ? (
                  <View style={styles.promptContainer}>
                    <ActivityIndicator size="large" color="#1E6091" style={styles.loadingIndicator} />
                    <Text style={styles.promptText}>Enregistrement en cours...</Text>
                    <Text style={styles.promptSubText}>Veuillez patienter</Text>
                  </View>
                ) : showAnalysePrompt ? (
                  <View style={styles.promptContainer}>
                    <Text style={styles.promptText}>Enregistrement terminé</Text>
                    <Text style={styles.promptSubText}>Veuillez cliquer sur le bouton "Analyse"</Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <WebView
                ref={webViewRef}
                source={{ uri: webViewUrl }}
                style={styles.video}
                allowsInlineMediaPlayback
                javaScriptEnabled
                onLoadEnd={handleLoadEnd}
                onError={handleError}
              />
            )}
            <View style={styles.overlayContainer}>
              <View style={styles.iaActiveLabel}>
                <Text style={styles.iaActiveText}>IA ACTIVE</Text>
              </View>
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot}></View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Caméra non connectée</Text>
            <Text style={styles.errorSubText}>
              Veuillez vérifier la connexion et réessayer
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={retryConnection}
            >
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.controlsContainer}>
        <ButtonFuncs 
          icon="activity" 
          text="Analyse" 
          disabled={!isConnected || (!showAnalysePrompt && isRecording)}
          onPress={showAnalysePrompt ? handleAnalyse : undefined}
        />
        <ButtonFuncs 
          onPress={settingUrlWebView} 
          icon="refresh-cw" 
          text="Reload" 
          disabled={!isConnected || isRecording} 
        />
        <ButtonFuncs 
          onPress={saveVideo} 
          icon="video" 
          text="Record" 
          disabled={!isConnected || isRecording} 
        />
      </View>

      <View style={styles.statsContainer}>
        <OnlineCardState state={true} text="Tempeature" value="50°C" />
        <OnlineCardState state={false} text="Smoke/Gaz" value="3% / 12ppm" />
      </View>

      <CardButton
        style={styles.alertButton}
        text="ALERT D'URGENCE"
        color="#F28C38"
      />
    </View>
  );
}

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  videoContainer: {
    width: "90%",
    height: 350,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#475569",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  overlayContainer: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  iaActiveLabel: {
    backgroundColor: "#1E6091",
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  iaActiveText: {
    color: "white",
    fontWeight: "500",
  },
  recordingIndicator: {
    width: 24,
    height: 24,
    backgroundColor: "#ef4444",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  recordingDot: {
    width: 12,
    height: 12,
    backgroundColor: "white",
    borderRadius: 6,
  },
  controlsContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 24,
    justifyContent: "center",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 20,
    marginTop: 24,
    justifyContent: "center",
  },
  alertButton: {
    marginTop: 24,
    width: "90%",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  errorSubText: {
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#1E6091",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    color: "white",
    fontWeight: "500",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    marginTop: 10,
  },
  // New styles for countdown and prompt
  recordingOverlay: {
    flex: 1,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
  },
  countdownText: {
    fontSize: 120,
    fontWeight: "bold",
    color: "white",
  },
  promptContainer: {
    alignItems: "center",
    padding: 20,
  },
  promptText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
  },
  promptSubText: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
  },
  loadingIndicator: {
    marginBottom: 20,
  }
});