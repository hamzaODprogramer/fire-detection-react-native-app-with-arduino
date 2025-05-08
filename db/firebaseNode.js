import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDKRUTn2NQ96fh0uX2YPxgvTOQcb-tlw9s",
  authDomain: "fire-detection-arduino2.firebaseapp.com",
  projectId: "fire-detection-arduino2",
  storageBucket: "fire-detection-arduino2.firebasestorage.app",
  messagingSenderId: "563052078695",
  appId: "1:563052078695:web:0effe5ba27c6043178d6c2",
  databaseURL: "https://fire-detection-arduino2-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);