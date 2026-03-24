import axios from 'axios';

const getBaseUrl = () => {
  // If explicitly set to a remote URL, use it
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl;
  }
  
  // If running in the browser, dynamically use the current hostname
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // Connects to port 5001 on whatever server is hosting the frontend
      return `${protocol}//${hostname}:5001/api`;
    }
  }

  // Fallback for local development
  return 'http://localhost:5001/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
