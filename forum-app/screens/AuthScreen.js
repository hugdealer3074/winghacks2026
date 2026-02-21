// screens/AuthScreen.js
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateAnonymousUsername } from '../utils/usernameGenerator';

export default function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Generate anonymous username
      const anonymousUsername = generateAnonymousUsername();

      // Create mock user (later this will be API call)
      const user = {
        id: `user_${Date.now()}`,
        email: email.toLowerCase(),
        anonymousUsername: anonymousUsername,
        createdAt: new Date().toISOString(),
      };

      // Save to AsyncStorage (mock database)
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      await AsyncStorage.setItem(`user_${email}`, JSON.stringify({
        ...user,
        password: password, // In real app, this would be hashed!
      }));

      Alert.alert(
        'Welcome!',
        `Your anonymous username is: ${anonymousUsername} 🎉`,
        [{ text: 'OK', onPress: () => onLogin(user) }]
      );
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Get user from AsyncStorage (mock database)
      const userJson = await AsyncStorage.getItem(`user_${email}`);
      
      if (!userJson) {
        Alert.alert('Error', 'Account not found. Please sign up.');
        setLoading(false);
        return;
      }

      const user = JSON.parse(userJson);

      // Check password
      if (user.password !== password) {
        Alert.alert('Error', 'Invalid password');
        setLoading(false);
        return;
      }

      // Save current user
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));

      Alert.alert(
        'Welcome back!',
        `Logged in as ${user.anonymousUsername} 👋`,
        [{ text: 'OK', onPress: () => onLogin(user) }]
      );
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          {/* Logo/Title */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>👶</Text>
            <Text style={styles.appTitle}>Parent Forum</Text>
            <Text style={styles.appTagline}>
              Anonymous support for new parents
            </Text>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, isLogin && styles.tabActive]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isLogin && styles.tabActive]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password (min 6 characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          {!isLogin && (
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>🎭</Text>
              <Text style={styles.infoText}>
                You'll get a fun anonymous username like "HappyPanda42"
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={isLogin ? handleLogin : handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
            </Text>
          </TouchableOpacity>

          {/* Privacy Notice */}
          <View style={styles.privacyNotice}>
            <Text style={styles.privacyText}>
              🔒 Your identity stays private. Only your anonymous username is visible to others.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3c6449',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#3c6449',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2e7d32',
  },
  button: {
    backgroundColor: '#3c6449',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  privacyNotice: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#fff3e0',
    borderRadius: 12,
  },
  privacyText: {
    color: '#e65100',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});