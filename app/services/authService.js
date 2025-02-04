import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, getAuthHeader } from '../../config';

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@user_data';

const authService = {
  // Register new user  
  register: async (userData) => {
    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`,
        userData
      );
      const { token, user } = response.data;
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      return { token, user };
    } catch (error) {
      if (error.response) {
        // The server responded with an error
        throw new Error(error.response.data.message || 'Registration failed');
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        throw new Error('Error setting up the request');
      }
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log('Attempting login to:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`);
      
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      
      return { token, user };
    } catch (error) {
      console.error('Login error details:', error);
      
      if (error.response) {
        // The server responded with an error status
        throw new Error(error.response.data.message || 'Invalid credentials');
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        throw new Error('Error setting up the request');
      }
    }
  },

  // Get current user data
  getCurrentUser: async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) return null;

      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_USER}`,
        getAuthHeader(token)
      );

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Token is invalid or expired
        await authService.logout();
        return null;
      }
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Check if user is logged in
  isLoggedIn: async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return !!token;
    } catch (error) {
      return false;
    }
  }
};

export default authService;