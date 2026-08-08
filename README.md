# 🔥 Fire Detection Mobile App - React Native

Ce projet est une application mobile développée en **React Native** dans le cadre du module **Programmation Mobile** du **Master IAII** à la FST Marrakech. L'application s'interface avec un robot équipé de capteurs pour la **détection précoce des incendies**, et utilise l'**IA pour analyser la scène**.

## 👨‍💻 Membres de l'équipe
- Laaliji Zakariae  
- Hnioua Abdessamad  
- Ouadoud Hamza

## 🧠 Encadré par
- M. Bourkoukou

## 📱 Fonctionnalités de l'application

- 📡 Réception des données en temps réel (température, humidité, gaz/fumée) via WiFi.
- 🔔 Notifications instantanées en cas de détection de danger.
- 📷 Accès au flux vidéo en direct de l’ESP32-CAM.
- 🧠 Analyse des images via un modèle d’intelligence artificielle (hébergé dans le Cloud) pour :
  - Détecter la présence humaine.
  - Évaluer l'état des victimes.
- 🧭 Interface utilisateur intuitive pour une réaction rapide et efficace.

## ⚙️ Stack technologique

### Frontend
- [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Axios](https://axios-http.com/) pour les requêtes HTTP
- [Socket.IO client](https://socket.io/docs/v4/client-api/) (optionnel pour la communication en temps réel)
- [React Native Paper](https://callstack.github.io/react-native-paper/) pour les composants UI

### Backend / IA
- API Flask
- Modèle CNN avec TensorFlow ou PyTorch pour la détection des victimes
- Communication via HTTP

### Base de données
- [Firebase](https://firebase.google.com/) pour stocker les événements
