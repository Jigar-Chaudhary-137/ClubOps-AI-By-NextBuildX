/**
 * Announcements API Client Service
 * Connects announcement operations to real backend REST & AI endpoints.
 */

import apiClient from './client';

export async function getAnnouncements(params = {}) {
  const response = await apiClient.get('/announcements', { params });
  return response.data;
}

export async function getAnnouncementById(id) {
  const response = await apiClient.get(`/announcements/${id}`);
  return response.data;
}

export async function createAnnouncement(data) {
  const response = await apiClient.post('/announcements', data);
  return response.data;
}

export async function updateAnnouncement(id, data) {
  const response = await apiClient.put(`/announcements/${id}`, data);
  return response.data;
}

export async function deleteAnnouncement(id) {
  const response = await apiClient.delete(`/announcements/${id}`);
  return response.data;
}

export async function publishAnnouncement(id, options = {}) {
  const response = await apiClient.post(`/announcements/${id}/broadcast`, options);
  return response.data;
}

export async function broadcastAnnouncement(id, channels, deliveryMode) {
  const response = await apiClient.post(`/announcements/${id}/broadcast`, { channels, deliveryMode });
  return response.data;
}

export async function scheduleAnnouncement(id, scheduledTime) {
  const response = await apiClient.put(`/announcements/${id}`, { scheduledFor: scheduledTime, status: 'scheduled' });
  return response.data;
}

export async function cancelScheduledAnnouncement(id) {
  const response = await apiClient.put(`/announcements/${id}`, { status: 'draft' });
  return response.data;
}

export async function archiveAnnouncement(id) {
  const response = await apiClient.put(`/announcements/${id}`, { status: 'archived' });
  return response.data;
}

export async function generateAnnouncementContent(prompt, context = {}) {
  const response = await apiClient.post('/ai/generate-announcement', { topic: prompt, ...context });
  return response.data;
}

export async function adaptAnnouncementTone(id, targetTone) {
  const response = await apiClient.post('/ai/generate-announcement', { announcementId: id, tone: targetTone });
  return response.data;
}

export async function suggestAnnouncements(context = {}) {
  const response = await apiClient.get('/announcements', { params: context });
  return response.data;
}

export async function previewAnnouncementRecipients(data) {
  const response = await apiClient.post('/announcements/preview-recipients', data);
  return response.data;
}

export async function getClubMembers() {
  const response = await apiClient.get('/announcements/club-members');
  return response.data;
}

export async function getProviderHealthStatus() {
  const response = await apiClient.get('/announcements/providers/status');
  return response.data;
}

export async function sendControlledTest(data) {
  const response = await apiClient.post('/announcements/providers/test', data);
  return response.data;
}

export async function registerDeviceToken(token, platform = 'web') {
  const response = await apiClient.post('/notifications/register-device', { token, platform });
  return response.data;
}

export async function updateNotificationPreferences(preferences) {
  const response = await apiClient.patch('/notifications/preferences', preferences);
  return response.data;
}

export const announcementsService = {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
  broadcastAnnouncement,
  scheduleAnnouncement,
  cancelScheduledAnnouncement,
  archiveAnnouncement,
  generateAnnouncementContent,
  adaptAnnouncementTone,
  suggestAnnouncements,
  previewAnnouncementRecipients,
  getClubMembers,
  getProviderHealthStatus,
  sendControlledTest,
  registerDeviceToken,
  updateNotificationPreferences
};

export default announcementsService;
