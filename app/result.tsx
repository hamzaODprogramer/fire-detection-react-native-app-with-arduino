import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ScrollView, 
  Animated, 
  Dimensions,
  ActivityIndicator 
} from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import { Video, ResizeMode } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { Linking } from 'react-native';

const { width } = Dimensions.get('window');

const FireAlertResults: React.FC = () => {
  const params = useLocalSearchParams();
  const videoUri = params.videoUri as string;
  const status = params.status as string;
  console.log('videoUri', videoUri);
  
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<Video>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    console.log("status:", status);
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      })
    ]);
    
    Animated.loop(pulse).start();
  }, []);

  const handleShare = () => {
    Alert.alert("Share Alert", "The alert has been shared with your emergency contacts.");
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      "Emergency Call",
      "Do you want to contact emergency services?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call", onPress: () => Alert.alert("Calling...") }
      ]
    );
  };

  const isDanger = (status === 'InDanger' ? true : false);
  
  const headerBackgroundColor = isDanger ? '#DC2626' : '#10B981';
  const headerIcon = isDanger ? 'alert-triangle' : 'check-circle';
  const headerTitle = isDanger ? 'FIRE ALERT' : 'NO DANGER DETECTED';
  const severityBadgeColor = isDanger ? '#FEE2E2' : '#D1FAE5';
  const severityBorderColor = isDanger ? '#DC2626' : '#10B981';
  const severityTextColor = isDanger ? '#991B1B' : '#065F46';
  const severityText = isDanger ? 'CRITICAL' : 'NORMAL';
  const progressBarColor = isDanger ? '#DC2626' : '#10B981';
  const emergencyButtonColor = isDanger ? '#DC2626' : '#6B7280';
  const emergencyButtonShadowColor = isDanger ? "#DC2626" : "#6B7280";
  const emergencyButtonPulse = isDanger;

  return <>
    <Stack.Screen options={{ headerShown: false }} />
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.header, { backgroundColor: headerBackgroundColor }]}>
        <View style={styles.headerContent}>
          <Icon name={headerIcon} size={24} color="#fff" style={styles.headerIconLeft} />
          <Text style={styles.headerText}>{headerTitle}</Text>
          <TouchableOpacity onPress={()=>router.replace('/(tabs)')} style={styles.shareButton}>
            <Icon name="home" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerTimestamp}>
          <Icon name="clock" size={14} color="rgba(255,255,255,0.8)" />
          <Text style={styles.timestampText}>
            Detected {60} {60 > 1 ? 'secs' : 'sec'} ago
          </Text>
        </View>
      </View>

      <View style={styles.videoWrapper}>
        <Video 
          style={styles.videoContainer}
          ref={videoRef}
          source={{ uri: videoUri }}
          useNativeControls
          resizeMode={ResizeMode.COVER}
          isLooping
          onLoad={() => console.log("Video loaded")}
          onError={(error) => console.error("Video error:", error)}
        />
        <View style={[styles.liveIndicator, { backgroundColor: isDanger ? 'rgba(220, 38, 38, 0.9)' : 'rgba(16, 185, 129, 0.9)' }]}>
          <Icon name="video" size={15} color="white" />
          <Text style={styles.liveText}>Analyzed</Text>
        </View>
      </View>
      
      <View style={styles.analysisCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Incident Analysis</Text>
          <View style={[styles.severityBadge, { 
            backgroundColor: severityBadgeColor,
            borderLeftColor: severityBorderColor
          }]}>
            <Text style={[styles.severityText, { color: severityTextColor }]}>
              {severityText}
            </Text>
          </View>
        </View>
        
        <View style={styles.metricContainer}>
          <View style={styles.metricLabelRow}>
            <Text style={styles.metricLabel}>Temperature</Text>
            <Text style={styles.metricValue}>{params.temperature}°C</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[
              styles.progressBar, 
              { 
                width: `${params.temperature as unknown as number}%`,
                backgroundColor: progressBarColor 
              }
            ]} />
          </View>
        </View>
        
        <View style={styles.metricContainer}>
          <View style={styles.metricLabelRow}>
            <Text style={styles.metricLabel}>Gas Level</Text>
            <Text style={styles.metricValue}>{params.gaz}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[
              styles.progressBar, 
              { 
                width: `${params.gaz as unknown as number}%`,
                backgroundColor: progressBarColor 
              }
            ]} />
          </View>
        </View>
      </View>

      <View style={[styles.statusMessageContainer, 
        { backgroundColor: isDanger ? 'rgba(254, 226, 226, 0.5)' : 'rgba(209, 250, 229, 0.5)' }
      ]}>
        <Icon 
          name={isDanger ? "alert-triangle" : "info"} 
          size={24} 
          color={isDanger ? "#DC2626" : "#10B981"} 
        />
        <Text style={[styles.statusMessageText, 
          { color: isDanger ? "#991B1B" : "#065F46" }
        ]}>
          {isDanger 
            ? "A fire has been detected. Please evacuate the area immediately and contact emergency services." 
            : "No fire detected. The area is secure."}
        </Text>
      </View>

      {isDanger && (
        <View style={styles.safetyInstructionsContainer}>
          <Text style={styles.safetyInstructionsTitle}>Safety Instructions:</Text>
          <View style={styles.safetyInstruction}>
            <Icon name="log-out" size={20} color="#991B1B" />
            <Text style={styles.safetyInstructionText}>Evacuate the building calmly</Text>
          </View>
          <View style={styles.safetyInstruction}>
            <Icon name="phone" size={20} color="#991B1B" />
            <Text style={styles.safetyInstructionText}>Contact emergency services</Text>
          </View>
          <View style={styles.safetyInstruction}>
            <Icon name="users" size={20} color="#991B1B" />
            <Text style={styles.safetyInstructionText}>Help people with reduced mobility</Text>
          </View>
        </View>
      )}

      <Animated.View style={[
        styles.emergencyButtonContainer, 
        emergencyButtonPulse ? { transform: [{ scale: pulseAnim }] } : {}
      ]}>
        <TouchableOpacity
          style={[styles.emergencyButton, { backgroundColor: emergencyButtonColor }]}
          onPress={() => Linking.openURL('tel:15')}
          activeOpacity={0.8}
        >
          <Icon name="phone-call" size={24} color="#fff" style={styles.emergencyIcon} />
          <Text style={styles.emergencyText}>
            {isDanger ? "CONTACT EMERGENCY SERVICES" : "REPORT A PROBLEM"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  </>
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
    paddingTop: 40,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4B5563',
  },
  header: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIconLeft: {
    marginRight: 10,
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTimestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'center',
  },
  timestampText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginLeft: 4,
  },
  videoWrapper: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  videoContainer: {
    height: 240,
    backgroundColor: '#1F2937',
    width: '100%',
  },
  liveIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  analysisCard: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  severityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderLeftWidth: 4,
  },
  severityText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  metricContainer: {
    marginBottom: 14,
  },
  metricLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metricLabel: {
    color: '#4B5563',
    fontSize: 14,
  },
  metricValue: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  progressBarBg: {
    backgroundColor: '#E5E7EB',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  statusMessageContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusMessageText: {
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  safetyInstructionsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  safetyInstructionsTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#991B1B',
    marginBottom: 12,
  },
  safetyInstruction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  safetyInstructionText: {
    marginLeft: 12,
    color: '#991B1B',
    fontSize: 14,
  },
  emergencyButtonContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  emergencyButton: {
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emergencyIcon: {
    marginRight: 12,
  },
  emergencyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FireAlertResults;