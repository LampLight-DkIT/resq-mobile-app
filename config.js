// API Configuration
export const API_CONFIG = {
    // Replace with your local IP address when testing with a physical device
    // Use 10.0.2.2 for Android emulator to access localhost
    // Use localhost for iOS simulator
    BASE_URL: 'http://192.168.240.253:5000/api', // Assuming your backend runs on port 3000
    SOCKET_URL: 'ws://192.168.240.253:5000', // Socket.IO should connect to base URL
    ENDPOINTS: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      GET_USER: '/auth/user'
    }
  };
  
  // Authentication header configuration
  export const getAuthHeader = (token) => ({
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });