import ButtonFuncs from "@/components/home/ButtonFuncs";
import CardButton from "@/components/home/CardButton";
import OnlineCardState from "@/components/home/OnlineCardState";
import React, { useState, useRef, useEffect } from "react";
import { Text, View, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Modal, Image, Linking } from "react-native";
import { WebView } from "react-native-webview";
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import {CONFIG} from '@/config'
import {BlurView} from 'expo-blur'
import { router } from "expo-router";
import { addHistoric } from "@/db/actions";
interface EnvConfig {
  SERVER_BASE_URL: string;
  ESP32_CAMERA_STREAM_URL: string;
}

interface AnalysisResult {
  video_id: string;
  duration?: number;
  success?: boolean;
  message?: string;
  status : string;
  video_url?: string;
}

export default function Online() {
  const CAMERA_ESP_LINK = CONFIG.CAMERA_ESP_LINK;
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showAnalysisResult, setShowAnalysisResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showProcessedVideo, setShowProcessedVideo] = useState(false);
  const [processedVideoUri, setProcessedVideoUri] = useState<string | null>(null);
  const videoRef = useRef<Video>(null);
  const webViewRef = useRef<WebView>(null);
  const [webViewUrl, setWebViewUrl] = useState(CAMERA_ESP_LINK);
  
  // States for recording workflow
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingInProgress, setRecordingInProgress] = useState(false);
  const [recordingFinished, setRecordingFinished] = useState(false);
  const [showAnalysePrompt, setShowAnalysePrompt] = useState(false);
  
  // Reference to store the polling interval
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const envConfig = Constants.expoConfig?.extra as EnvConfig;

  // Server URL configuration
  const SERVER_URL = CONFIG.SERVER_RECORDING_SERVICE_LINK

  const settingUrlWebView = () => {
    // Reset web view URL
    setWebViewUrl(CAMERA_ESP_LINK);
    
    // Reset recording states
    setIsRecording(false);
    setCountdown(null);
    setRecordingInProgress(false);
    setRecordingFinished(false);
    setShowAnalysePrompt(false);
    
    // Reset analysis states
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    setShowAnalysisResult(false);
    setAnalysisResult(null);
    
    // Reset error states
    setShowError(false);
    setErrorMessage("");
    
    // Reset video states
    setShowProcessedVideo(false);
    setProcessedVideoUri(null);
    
    // Reload the WebView if it exists
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
    
    // Clear any existing polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // Optional: Reset loading state if needed
    setIsLoading(true);
    
    console.log("App state completely reset");
  };

  // Countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCountdown(null);
      startRecordingOnServer();
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Start the recording on the server and set up polling
  const startRecordingOnServer = async () => {
    setRecordingInProgress(true);
    
    try {
      console.log("Starting recording on server:", `${SERVER_URL}/start_recording`);
      const response = await fetch(`${SERVER_URL}/start_recording`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      // Start polling for recording status
      startPollingRecordingStatus();
    } catch (error) {
      console.error("Error starting recording:", error);
      handleRecordingError();
    }
  };

  // Handle recording errors
  const handleRecordingError = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    setRecordingInProgress(false);
    settingUrlWebView();
    alert("Erreur d'enregistrement. Veuillez réessayer.");
  };

  // Polling function to check recording status
  const startPollingRecordingStatus = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    let pollAttempts = 0;
    const MAX_POLL_ATTEMPTS = 20;
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        console.log("Checking recording status, attempt:", pollAttempts + 1);
        
        const response = await fetch(`${SERVER_URL}/recording_status`);
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.log("Invalid response type:", contentType);
          throw new Error("Server didn't return JSON");
        }
        
        const data = await response.json();
        console.log("Recording status:", data);
        
        if (!data.isRecording) {
          console.log("Recording complete, updating UI");
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          setRecordingInProgress(false);
          setRecordingFinished(true);
          setShowAnalysePrompt(true);
        }
      } catch (error) {
        console.error("Error checking recording status:", error);
        pollAttempts++;
        
        if (pollAttempts >= MAX_POLL_ATTEMPTS) {
          console.log("Max polling attempts reached, assuming recording is complete");
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          setRecordingInProgress(false);
          setRecordingFinished(true);
          setShowAnalysePrompt(true);
        }
      }
    }, 500);
  };

  const saveVideo = () => {
    setIsRecording(true);
    setCountdown(3);
    setWebViewUrl('about:blank');
  };

  const handleAnalyse = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setShowAnalysisResult(false);
    setShowError(false);
    
    try {
      console.log("Starting video analysis:", `${SERVER_URL}/analyze_video`);
      
      const progressInterval: NodeJS.Timeout = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 5, 90));
      }, 1000);

      const response = await fetch(`${SERVER_URL}/analyze_video`);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Analysis response:", data);
      
      if (data.success) {
        setAnalysisResult(data);
        setShowAnalysisResult(true);
        const videoResponse = await fetch(`${SERVER_URL}/get_analyzed_video`);
        if (videoResponse.ok) {
          const videoUrl = `${SERVER_URL}/get_analyzed_video`;
          setProcessedVideoUri(videoUrl);
          setAnalysisResult({
            status : data.status,
            message : data.message,
            video_id: data.video_id,
            video_url : videoUrl
          })
        }
        await addHistoric({
          state : (data.status === 'InDanger' ? false : true),
          date : new Date().toISOString(),
          gaz : 50,
          temperature : 20,
          time : new Date().toISOString(),
          createdAt: new Date().toISOString()
        })
      } else {
        setErrorMessage(data.message || "Erreur lors de l'analyse de la vidéo");
        setShowError(true);
      }
    } catch (error) {
      console.error('Error analyzing video:', error);
      setErrorMessage("Erreur lors de l'analyse de la vidéo. Veuillez vérifier que le serveur est en cours d'exécution.");
      setShowError(true);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const handleViewProcessedVideo = () => {
    router.replace({
      pathname : '/result',
      params : {
        videoUri : CONFIG.SERVER_HANDLING_VIDEO_SERVICE_LINK + `/get_handled_video/${analysisResult?.video_id}`,
        status : String(analysisResult?.status),
      }
    })
    // setShowProcessedVideo(true);
    setShowAnalysisResult(false);
  };

  const handleCloseProcessedVideo = () => {
    setShowProcessedVideo(false);
    if (videoRef.current) {
      videoRef.current.pauseAsync();
    }
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

  return <>
    <Modal
        visible={showAnalysisResult}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAnalysisResult(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Résultat de l'analyse</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowAnalysisResult(false)}
              >
                <Ionicons name="close" size={24} color="#1E6091" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.resultContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              </View>
              
              <Text style={styles.resultTitle}>Analyse réussie!</Text>
              
              <View style={styles.resultDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={20} color="#1E6091" />
                  <Text style={styles.detailText}>Durée: {analysisResult?.duration?.toFixed(2) || '0.00'} secondes</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="videocam-outline" size={20} color="#1E6091" />
                  <Text style={styles.detailText}>ID: {analysisResult?.video_id}</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.viewVideoButton}
                onPress={handleViewProcessedVideo}
              >
                <Text style={styles.viewVideoText}>Voir la resultats</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showProcessedVideo}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseProcessedVideo}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.videoModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Vidéo analysée</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleCloseProcessedVideo}
              >
                <Ionicons name="close" size={24} color="#1E6091" />
              </TouchableOpacity>
            </View>
            
            <Video
              ref={videoRef}
              style={styles.processedVideo}
              source={{ uri: processedVideoUri || '' }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showError}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowError(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Erreur</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowError(false)}
              >
                <Ionicons name="close" size={24} color="#1E6091" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.errorResultContainer}>
              <View style={styles.errorIcon}>
                <Ionicons name="alert-circle" size={48} color="#EF4444" />
              </View>
              
              <Text style={styles.errorResultText}>{errorMessage}</Text>
              
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                  setShowError(false);
                  handleAnalyse();
                }}
              >
                <Text style={styles.retryText}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={isAnalyzing}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAnalysisResult(false)}
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E6091" />
            <Text style={styles.loadingText}>Analyse en cours...</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${analysisProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{analysisProgress}%</Text>
          </View>
        </View>
      </Modal>
      {
        (showError || showAnalysisResult || showProcessedVideo || isAnalyzing)
        ? <BlurView intensity={100} style={styles.container}>
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
                // disabled={!isConnected || isAnalyzing}
                onPress={handleAnalyse}
              />
              <ButtonFuncs 
                onPress={settingUrlWebView} 
                icon="refresh-cw" 
                text="Reload" 
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
          </BlurView>
        : <View style={styles.container}>
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
                // disabled={!isConnected || isAnalyzing}
                onPress={handleAnalyse}
              />
              <ButtonFuncs 
                onPress={settingUrlWebView} 
                icon="refresh-cw" 
                text="Reload" 
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
              onPress={() => Linking.openURL('tel:0688785') }
            />
          </View>
      }
    
  </>
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
  loadingContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    width: "80%",
  },
  loadingText: {
    color: "#1E6091",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#1E6091",
    borderRadius: 4,
  },
  progressText: {
    color: "#1E6091",
    fontSize: 14,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "90%",
    maxWidth: 400,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E6091",
  },
  closeButton: {
    padding: 8,
  },
  resultContainer: {
    alignItems: "center",
  },
  successIcon: {
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10B981",
    marginBottom: 20,
  },
  resultDetails: {
    width: "100%",
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    paddingRight:40,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  detailText: {
    marginLeft: 10,
    color: "#1E6091",
  },
  viewVideoButton: {
    backgroundColor: "#1E6091",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  viewVideoText: {
    color: "white",
    fontWeight: "500",
  },
  errorResultContainer: {
    alignItems: "center",
    padding: 20,
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorResultText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 20,
  },
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
  },
  videoModalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "90%",
    maxWidth: 400,
    padding: 20,
  },
  processedVideo: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginTop: 20,
  }
});