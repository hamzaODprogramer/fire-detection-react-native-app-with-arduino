import { initializeApp } from "firebase/app";
import { 
  initializeAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail 
} from "firebase/auth";
import { getDatabase, ref, set, get } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKRUTn2NQ96fh0uX2YPxgvTOQcb-tlw9s",
  authDomain: "fire-detection-arduino2.firebaseapp.com",
  projectId: "fire-detection-arduino2",
  storageBucket: "fire-detection-arduino2.firebasestorage.app",
  messagingSenderId: "563052078695",
  appId: "1:563052078695:web:0effe5ba27c6043178d6c2",
  databaseURL: "https://fire-detection-arduino2-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app);

const db = getDatabase(app);

// User ID storage keys
const USER_ID_KEY = '@FireDetection:userId';

// Store user ID in AsyncStorage
export const storeUserId = async (userId: string) => {
  try {
    await AsyncStorage.setItem(USER_ID_KEY, userId);
    return { success: true };
  } catch (error) {
    console.error('Error storing user ID:', error);
    return { error };
  }
};

// Get user ID from AsyncStorage
export const getUserId = async () => {
  try {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    return { userId };
  } catch (error) {
    console.error('Error getting user ID:', error);
    return { error };
  }
};

export const clearUserId = async () => {
  try {
    await AsyncStorage.removeItem(USER_ID_KEY);
    return { success: true };
  } catch (error) {
    console.error('Error clearing user ID:', error);
    return { error };
  }
};

// Register with email and password
export const registerWithEmailAndPassword = async ({ 
  email, 
  password, 
  displayName 
}: { 
  email: string; 
  password: string; 
  displayName: string; 
}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await set(ref(db, `users/${user.uid}`), {
      uid: user.uid,
      email,
      displayName,
      createdAt: new Date().toISOString(),
    });

    await storeUserId(user.uid);

    return { user };
  } catch (error) {
    return { error };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    await storeUserId(userCredential.user.uid);
    
    return { user: userCredential.user };
  } catch (error) {
    return { error };
  }
};

export const logOut = async () => {
  try {
    // First clear the user ID from storage
    await clearUserId();
    
    // Then sign out from Firebase
    await signOut(auth);
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { error };
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { error };
  }
};

export const subscribeToAuthChanges = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      storeUserId(user.uid);
    } else {
      clearUserId();
    }
    callback(user);
  });
};

export const getCurrentUserData = async () => {
  try {
    const { userId } = await getUserId();
    
    if (!userId) {
      return { error: 'No user ID found' };
    }
    
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      return { userData: snapshot.val() };
    } else {
      return { error: 'User data not found' };
    }
  } catch (error) {
    return { error };
  }
};

export { auth, db };