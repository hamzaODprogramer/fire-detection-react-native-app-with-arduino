import ButtonFuncs from "@/components/home/ButtonFuncs";
import CardButton from "@/components/home/CardButton";
import OnlineCardState from "@/components/home/OnlineCardState";
import React, { useState, useEffect, useRef } from "react";
import { Text, View, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";

export default function Online() {
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef(null);

  const saveVideo = async () => {
    const response = await fetch('http://192.168.1.106:3001/start_recording')
  }

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

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        {isConnected ? (
          <>
            <WebView
              ref={webViewRef}
              source={{ uri: "http://192.168.1.143:81/stream" }}
              style={styles.video}
              allowsInlineMediaPlayback
              javaScriptEnabled
              onLoadEnd={handleLoadEnd}
              onError={handleError}
            />
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
        <ButtonFuncs icon="activity" text="Analyse IA" disabled={!isConnected} />
        <ButtonFuncs onPress={saveVideo} icon="video" text="Record" disabled={!isConnected} />
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
  },
});