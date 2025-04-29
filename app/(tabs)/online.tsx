import ButtonFuncs from "@/components/home/ButtonFuncs";
import CardButton from "@/components/home/CardButton";
import OnlineCardState from "@/components/home/OnlineCardState";
import React, { useState, useEffect, useRef } from "react";
import { Text, View, StyleSheet, Dimensions } from "react-native";
import { Video } from 'expo-av';

export default function Online() {
    const [status, setStatus] = useState({});
    const videoSource = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    const video = useRef(null);
    
    const handlePlayVideo = async () => {
        if (video.current) {
            await video.current.playAsync();
        }
    };
    
    const handlePauseVideo = async () => {
        if (video.current) {
            await video.current.pauseAsync();
        }
    };
    
    const handleAnalyzeVideo = () => {
        // Add your video analysis functionality here
        console.log("Analyzing video...");
    };
    
    return (
        <View style={styles.container}>
            <View style={styles.videoContainer}>
                <Video
                    ref={video}
                    source={{ uri: videoSource }}
                    rate={1.0}
                    volume={1.0}
                    isMuted={false}
                    resizeMode="cover"
                    shouldPlay={true} 
                    isLooping
                    style={styles.video}
                    onPlaybackStatusUpdate={status => setStatus(() => status)}
                />
                <View style={styles.overlayContainer}>
                    <View style={styles.iaActiveLabel}>
                        <Text style={styles.iaActiveText}>IA ACTIVE</Text>
                    </View>
                    <View style={styles.recordingIndicator}>
                        <View style={styles.recordingDot}></View>
                    </View>
                </View>
                
                {/* Playback Status Indicator */}
                {status.isPlaying && (
                    <View style={styles.playingIndicator}>
                        <Text style={styles.playingText}>▶ Playing</Text>
                    </View>
                )}
            </View>
            
            <View style={styles.controlsContainer}>
                <ButtonFuncs text="Analyse IA" onPress={handleAnalyzeVideo} />
                <ButtonFuncs icon="play" text="Play" onPress={handlePlayVideo} />
                <ButtonFuncs icon="pause" text="Pause" onPress={handlePauseVideo} />
            </View>
            
            <View style={styles.statsContainer}>
                <OnlineCardState state={true} text="Tempeature" value="50°C"/>
                <OnlineCardState state={false} text="Smoke/Gaz" value="3% / 12ppm"/>
            </View>
            
            <CardButton style={styles.alertButton} text="ALERT D'URGENCE" color="#F28C38" />
        </View>
    );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginTop: 20,
        width: '100%',
    },
    videoContainer: {
        width: '90%',
        height: 350,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#475569',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    overlayContainer: {
        position: 'absolute',
        top: 10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    iaActiveLabel: {
        backgroundColor: '#1E6091',
        paddingVertical: 4,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    iaActiveText: {
        color: 'white',
        fontWeight: '500',
    },
    recordingIndicator: {
        width: 24,
        height: 24,
        backgroundColor: '#ef4444',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordingDot: {
        width: 12,
        height: 12,
        backgroundColor: 'white',
        borderRadius: 6,
    },
    playingIndicator: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    playingText: {
        color: 'white',
        fontWeight: '500',
    },
    controlsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 24,
        justifyContent: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 24,
        justifyContent: 'center',
    },
    alertButton: {
        marginTop: 24,
        width: '90%',
    },
});