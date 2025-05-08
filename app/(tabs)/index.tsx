import { StyleSheet, Text, View, Alert, Animated, Easing } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import RobotState from '@/components/home/RobotState';
import CardState from '@/components/home/CardState';
import CardButton from '@/components/home/CardButton';
import { router } from 'expo-router';
import { getSensorData } from '@/db/actions';
import { Audio } from 'expo-av';

interface SensorDataRecord {
  temperature : string,
  valeur_gaz : string,
  humidite : string,
  gaz_detecte : string
}

export default function HomeScreen() {

  useEffect(()=>{
    setInterval(async()=>{
      const { sensorData, error } = await getSensorData()
      if (error) {
        console.log(error)
      } else if (sensorData) {
        setSensorValues(sensorData)
      }
    },2000)
  },[])

  const [sensorValues, setSensorValues] = useState<SensorDataRecord>({
    temperature: '0',
    humidite: '0',
    gaz_detecte: '0',
    valeur_gaz: '0'
  });

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);

  const playSound = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/alert_sound.mp3'),
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsSoundLoaded(true);
    } catch (error) {
      console.error('Error playing sound:', error);
      setIsSoundLoaded(false);
    }
  }

  const stopSound = async () => {
    try {
      if (sound && isSoundLoaded) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setIsSoundLoaded(false);
      }
    } catch (error) {
      console.error('Error stopping sound:', error);
    } finally {
      setSound(null);
      setIsSoundLoaded(false);
    }
  }

  useEffect(() => {
    return () => {
      if (sound && isSoundLoaded) {
        sound.stopAsync().catch(console.error);
        sound.unloadAsync().catch(console.error);
      }
    };
  }, [sound, isSoundLoaded]);

  const thresholds = {
    temperature: 75,  
    humidity: 80,     
    smoke: 30,        
    gas: 50           
  };

  const blinkAnim = useRef(new Animated.Value(0)).current;
  
  const hasAlert = 
    parseInt(sensorValues.temperature) > thresholds.temperature ||
    parseInt(sensorValues.humidite) > thresholds.humidity ||
    parseInt(sensorValues.gaz_detecte) > thresholds.smoke ||
    parseInt(sensorValues.valeur_gaz) > thresholds.gas;

  useEffect(() => {
    let blinkAnimation: Animated.CompositeAnimation | null = null;
    
    if (hasAlert) {
      blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: false
          }),
          Animated.timing(blinkAnim, {
            toValue: 0,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: false
          })
        ])
      );
      blinkAnimation.start();

      playSound();

      const timeoutId = setTimeout(() => {
        stopSound();
        router.replace('/online');
      }, 4000);

      return () => {
        if (blinkAnimation) {
          blinkAnimation.stop();
        }
        clearTimeout(timeoutId);
        stopSound();
      };
    } else {
      stopSound();
      blinkAnim.setValue(0);
    }
  }, [hasAlert]);

  const animatedBackgroundColor = blinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#ff000080'] 
  });

  return (
    <View style={styles.container}>
      <RobotState State={true} Battery={25} Connection={true}/>
      
      {hasAlert && (
        <Animated.View style={[
          styles.alertOverlay,
          { backgroundColor: animatedBackgroundColor }
        ]}>

        </Animated.View>
      )}
      
      <View style={styles.sensorGrid}>
        <View style={styles.sensorRow}>
          <CardState 
            ElementSensorName='Temperature' 
            Value={sensorValues.temperature + '°C'} 
            State={parseInt(sensorValues.temperature) <= thresholds.temperature} 
          />
          <CardState 
            ElementSensorName='Humidity' 
            Value={sensorValues.humidite + '%'} 
            State={parseInt(sensorValues.humidite) <= thresholds.humidity} 
          />
        </View>
        <View style={styles.sensorRow}>
          <CardState 
            ElementSensorName='Smoke' 
            Value={sensorValues.gaz_detecte + '%'} 
            State={parseInt(sensorValues.gaz_detecte) <= thresholds.smoke} 
          />
          <CardState 
            ElementSensorName='Gas' 
            Value={sensorValues.valeur_gaz + 'ppm'} 
            State={parseInt(sensorValues.valeur_gaz) <= thresholds.gas} 
          />
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <CardButton onPress={() => router.replace('/online')} color='#1E6091' text='View live camera'/>
        <View style={styles.buttonRow}>
          <CardButton onPress={() => router.replace('/historic')} style={styles.halfButton} color='#F28C38' text='Alerts history'/>
          <CardButton onPress={() => router.replace('/online')} style={styles.halfButton} color='#1E6091' text='AI analysis'/>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 24,
    flex: 1,
  },
  alertOverlay: {
    position: 'absolute',
    top: -4,
    left: -10,
    right: -10,
    bottom: 195,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderRadius: 16,
    margin: 16,
    padding:5
  },
  alertText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 20,
  },
  alertDetailText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 10,
  },
  sensorGrid: {
    marginTop: 24,
    gap: 16,
    zIndex: 1,
  },
  sensorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonContainer: {
    marginTop: 24,
    zIndex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  halfButton: {
    width: '48%',
  },
  emergencyButton: {
    marginTop: 16,
    borderWidth: 2,
    borderColor: 'white',
  }
});