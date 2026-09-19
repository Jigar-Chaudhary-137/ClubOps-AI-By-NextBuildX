import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to attach Auth Token from localStorage or sessionStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 if necessary or dispatch event
      console.warn('[apiClient] 401 Unauthorized encountered');
    }
    return Promise.reject(error);
  }
);

export function normalizeApiError(error) {
  if (error.response && error.response.data) {
    return error.response.data.message || error.response.data.error || 'An unexpected server error occurred.';
  }
  return error.message || 'Network request failed.';
}

export default apiClient;
