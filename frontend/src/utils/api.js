import axios from 'axios';
import { API_BASE_URL } from './config';

const instance = axios.create({
  baseURL: API_BASE_URL,
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
