import axios from 'axios';

const API = axios.create({
  baseURL: 'https://wildnorth.onrender.com/api',
  timeout: 10000,
  // withCredentials: true,   // <-- REMOVE or comment this line
});

// ─── Request interceptor ──────────────────────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ──────────────────────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/user-login') {
        window.location.href = '/user-login';
      }
    }
    if (error.message === 'Network Error' && !error.response) {
      console.warn('⚠️ Backend server is not reachable. Check if Flask is running.');
    }
    return Promise.reject(error);
  }
);

export default API;