/**
 * Authentication & User Session API Service
 * Connects login, registration, and user session retrieval to backend REST endpoints.
 */

import apiClient from './client';

/**
 * Log in with email and password
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} Backend response { success, message, data: { user, token, club } }
 */
export async function login(credentials) {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
}

/**
 * Register a new user and optionally create/join a club
 * @param {Object} userData - { name, email, password, role, clubName, clubCategory, clubCode }
 * @returns {Promise<Object>} Backend response { success, message, data: { user, token, club } }
 */
export async function register(userData) {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
}

/**
 * Fetch current authenticated user's profile and club context
 * @returns {Promise<Object>} Backend response { success, message, data: { user } }
 */
export async function getMe() {
  const response = await apiClient.get('/auth/me');
  return response.data;
}

/**
 * Create a new Club (Organizer / Admin only)
 * @param {Object} clubData - { name, description, category, code }
 * @returns {Promise<Object>} Backend response { success, message, data: { club } }
 */
export async function createClub(clubData) {
  const response = await apiClient.post('/auth/club', clubData);
  return response.data;
}

/**
 * Join an existing club using club code
 * @param {Object} codeData - { code }
 * @returns {Promise<Object>} Backend response { success, message, data: { user, club } }
 */
export async function joinClub(codeData) {
  const response = await apiClient.post('/auth/join-club', codeData);
  return response.data;
}

export const authService = {
  login,
  register,
  getMe,
  createClub,
  joinClub,
};

export default authService;
