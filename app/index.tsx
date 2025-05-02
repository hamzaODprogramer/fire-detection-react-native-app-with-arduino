import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
StatusBar, ActivityIndicator, KeyboardAvoidingView, 
  Platform, ScrollView, Keyboard, TouchableWithoutFeedback
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signInWithEmail, registerWithEmailAndPassword } from '@/db/firebase';
import { router } from 'expo-router';
import { Stack } from 'expo-router';

const EmailAuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailAuth = async () => {
    if (!email || !password) {
      setErrorMessage('Veuillez remplir tous les champs requis');
      return;
    }

    if (isSignUp && !displayName) {
      setErrorMessage('Veuillez entrer votre nom');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    
    try {
      let result : any;
      
      if (isSignUp) {
        result = await registerWithEmailAndPassword({email, password, displayName});
      } else {
        result = await signInWithEmail(email, password);
      }
      
      if (result.error) {
        let message = 'Username or password incorrect';
        
        if (result.error.code === 'auth/invalid-email') {
          message = 'Adresse email invalide';
        } else if (result.error.code === 'auth/user-not-found') {
          message = 'Aucun compte associé à cette adresse email';
        } else if (result.error.code === 'auth/wrong-password') {
          message = 'Mot de passe incorrect';
        } else if (result.error.code === 'auth/weak-password') {
          message = 'Le mot de passe doit contenir au moins 6 caractères';
        } else if (result.error.code === 'auth/email-already-in-use') {
          message = 'Cette adresse email est déjà utilisée';
        }
        
        setErrorMessage(message);
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setErrorMessage('');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1E6091','#1e40af', '#3b82f6']}
        style={styles.background}
      />
      
      <View 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollView}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>
                <Text style={styles.fireText}>Fire</Text>
                <Text style={styles.guardText}>Guard</Text>
              </Text>
              <Text style={styles.tagline}>Protection intelligente contre les incendies</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>{isSignUp ? 'Créer un compte' : 'Bienvenue'}</Text>
              <Text style={styles.subtitle}>
                {isSignUp 
                  ? 'Inscrivez-vous pour protéger votre espace contre les incendies'
                  : 'Connectez-vous pour accéder à votre tableau de bord de sécurité'
                }
              </Text>
              
              {isSignUp && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Nom</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Votre nom"
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="votre@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mot de passe</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Mot de passe"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>


              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}
              
              <TouchableOpacity 
                style={styles.authButton} 
                onPress={handleEmailAuth}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.authButtonText}>
                    {isSignUp ? 'S\'inscrire' : 'Se connecter'}
                  </Text>
                )}
              </TouchableOpacity>
              
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {isSignUp ? 'Vous avez déjà un compte?' : 'Vous n\'avez pas de compte?'}
                </Text>
                <TouchableOpacity onPress={toggleAuthMode}>
                  <Text style={styles.signupLink}>
                    {isSignUp ? 'Se connecter' : 'S\'inscrire'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={styles.disclaimer}>
              En vous connectant, vous acceptez nos{' '}
              <Text style={styles.link}>Conditions d'utilisation</Text> et notre{' '}
              <Text style={styles.link}>Politique de confidentialité</Text>
            </Text>
          </ScrollView>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 38,
    fontWeight: 'bold',
  },
  fireText: {
    color: '#fbbf24',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  guardText: {
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  tagline: {
    color: '#e5e7eb',
    fontSize: 16,
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 1,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: '85%',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    marginHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#1e3a8a',
  },
  subtitle: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 25,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#3b82f6',
    fontSize: 14,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  authButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  footerText: {
    color: '#64748b',
    fontSize: 15,
  },
  signupLink: {
    marginLeft: 6,
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 13,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 24,
    paddingHorizontal: 30,
    lineHeight: 18,
  },
  link: {
    color: '#ffffff',
    fontWeight: '500',
    textDecorationLine: 'underline',
  }
});

export default EmailAuthPage;