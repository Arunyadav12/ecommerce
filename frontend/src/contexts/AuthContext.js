import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { 
  getAuthToken, 
  setAuthToken, 
  clearAuthToken, 
  getCurrentUser, 
  setCurrentUser,
  isAuthenticated 
} from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated()) {
        try {
          const response = await authAPI.me();
          setUser(response.data);
          setCurrentUser(response.data);
        } catch (error) {
          console.error('Failed to get user info:', error);
          clearAuthToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { user: userData, token } = response.data;
      
      setAuthToken(token);
      setCurrentUser(userData);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user: userInfo, token } = response.data;
      
      setAuthToken(token);
      setCurrentUser(userInfo);
      setUser(userInfo);
      
      return { success: true, user: userInfo };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};