import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradien';
import { FontAwesome } from '@expo/vector-icons';

export default function WaitingScreen({  }) {
  const spinValue1 = new Animated.Value(0);
  const spinValue2 = new Animated.Value(0);
  
  const progressAnim = new Animated.Value(0);
  
  React.useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue1, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    
    Animated.loop(
      Animated.timing(spinValue2, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 10000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, []);
  
  const spin1 = spinValue1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  const spin2 = spinValue2.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });
  
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 240],
  });

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        <Animated.View style={[styles.circleOuter, { transform: [{ rotate: spin1 }] }]} />
        <Animated.View style={[styles.circleInner, { transform: [{ rotate: spin2 }] }]} />
      </View>
      
      <Text style={styles.loadingTitle}>Analyse vidéo en cours</Text>
      <Text style={styles.loadingSubtitle}>Détection d'incendie et analyse de risque</Text>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBackdrop} />
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>
      
      <Text style={styles.statusUpdate}>Étape 1/3 : Prétraitement vidéo</Text>
      
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Opérations en cours :</Text>
        <Text style={styles.detailsItem}>• Normalisation des images</Text>
        <Text style={styles.detailsItem}>• Analyse par réseau de neurones CNN</Text>
        <Text style={styles.detailsItem}>• Identification des zones à risque</Text>
      </View>
      
      <TouchableOpacity style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>Annuler l'analyse</Text>
      </TouchableOpacity>
    </View>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  statusBar: {
    width: '100%',
    height: 24,
    backgroundColor: '#1E6091',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 10,
  },
  statusBarTime: {
    color: 'white',
    fontSize: 12,
  },
  header: {
    width: '100%',
    height: 56,
    backgroundColor: '#1E6091',
    justifyContent: 'center',
    paddingLeft: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  animationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 120,
    marginTop: 80,
  },
  circleOuter: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: '#1E6091',
    borderTopColor: 'transparent',
  },
  circleInner: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FF7F2A',
    borderTopColor: 'transparent',
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E6091',
    marginTop: 100,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 10,
    textAlign: 'center',
  },
  progressContainer: {
    marginTop: 30,
    width: 240,
    height: 12,
    justifyContent: 'center',
  },
  progressBackdrop: {
    position: 'absolute',
    width: '100%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
  },
  progressFill: {
    height: 12,
    backgroundColor: '#1E6091',
    borderRadius: 6,
  },
  statusUpdate: {
    fontSize: 14,
    color: '#333333',
    marginTop: 28,
    textAlign: 'center',
  },
  detailsCard: {
    width: 280,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 20,
    marginTop: 30,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  detailsItem: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  cancelButton: {
    width: 280,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#1E6091',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#1E6091',
    fontWeight: '500',
  },
});