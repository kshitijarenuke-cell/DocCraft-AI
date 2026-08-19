import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('doccraft_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;

    if (status === 401) {
      localStorage.removeItem('doccraft_token');
      localStorage.removeItem('doccraft_user');
      window.location.href = '/auth';
    }

    // Enrich network error message
    if (err.message === 'Network Error' || !err.response) {
      err.message = 'Cannot reach the server. Make sure the backend is running on port 4000.';
    }

    return Promise.reject(err);
  }
);

export default api;
