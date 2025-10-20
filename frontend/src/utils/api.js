import axios from 'axios';

// Read backend URL from .env
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const instance = axios.create({
  baseURL: API,
});

// Attach token automatically if user is logged in
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
