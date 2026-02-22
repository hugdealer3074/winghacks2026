import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateAnonymousUsername } from '../utils/usernameGenerator';

interface User {
  id: string;
  email: string;
  anonymousUsername: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Please fill in all fields');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    try {
      // Check if user already exists
      const existingUser = await AsyncStorage.getItem(`user_${email}`);
      if (existingUser) {
        throw new Error('Account already exists. Please login.');
      }

      // Generate anonymous username
      const anonymousUsername = generateAnonymousUsername();

      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        email: email.toLowerCase(),
        anonymousUsername: anonymousUsername,
        createdAt: new Date().toISOString(),
      };

      // Save user data
      await AsyncStorage.setItem(`user_${email}`, JSON.stringify({
        ...newUser,
        password: password, // In production, this should be hashed!
      }));

      // Set as current user
      await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
      setUser(newUser);

      return; // Success
    } catch (error) {
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Please fill in all fields');
    }

    try {
      // Get user from storage
      const userJson = await AsyncStorage.getItem(`user_${email}`);
      
      if (!userJson) {
        throw new Error('Account not found. Please sign up.');
      }

      const userData = JSON.parse(userJson);

      // Check password
      if (userData.password !== password) {
        throw new Error('Invalid password');
      }

      // Set as current user (without password)
      const { password: _, ...userWithoutPassword } = userData;
      await AsyncStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);

      return; // Success
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('currentUser');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}