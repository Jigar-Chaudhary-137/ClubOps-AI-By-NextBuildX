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

export async function publishAnnouncement(id) {
  const response = await apiClient.post(`/announcements/${id}/broadcast`);
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

export async function getAnnouncementDeliveryStats(id) {
  const response = await apiClient.get(`/announcements/${id}`);
  return response.data;
}

export async function getAnnouncementActivity(id) {
  const response = await apiClient.get(`/announcements/${id}`);
  return response.data;
}

export const announcementsService = {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
  scheduleAnnouncement,
  cancelScheduledAnnouncement,
  archiveAnnouncement,
  generateAnnouncementContent,
  adaptAnnouncementTone,
  suggestAnnouncements,
  previewAnnouncementRecipients,
  getClubMembers,
  getAnnouncementDeliveryStats,
  getAnnouncementActivity,
};

export default announcementsService;
