import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Centralized Request Interceptor: Attach JWT Bearer token to all protected requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors and broadcast unauthorized event for protected endpoints
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
      // Only dispatch unauthorized event for protected workspace APIs (not login/register failures)
      if (!isAuthEndpoint) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export function normalizeApiError(error) {
  if (error.response && error.response.data) {
    return (
      error.response.data.message ||
      error.response.data.error ||
      'An unexpected server error occurred.'
    );
  }
  if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
    return 'Unable to connect to ClubOps AI. Please check that the server is running.';
  }
  return error.message || 'Network request failed.';
}

export default apiClient;
