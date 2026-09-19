/**
 * Meetings API Client Service
 * Connects meeting operations to real backend REST & AI endpoints.
 */

import apiClient from './client';

export async function getMeetings(params = {}) {
  const response = await apiClient.get('/meetings', { params });
  return response.data;
}

export async function getMeetingById(id) {
  const response = await apiClient.get(`/meetings/${id}`);
  return response.data;
}

export async function createMeeting(data) {
  const response = await apiClient.post('/meetings', data);
  return response.data;
}

export async function updateMeeting(id, data) {
  const response = await apiClient.put(`/meetings/${id}`, data);
  return response.data;
}

export async function deleteMeeting(id) {
  const response = await apiClient.delete(`/meetings/${id}`);
  return response.data;
}

export async function saveMeetingNotes(id, data) {
  const response = await apiClient.put(`/meetings/${id}`, data);
  return response.data;
}

export async function processMeeting(id, transcriptText) {
  const response = await apiClient.post(`/ai/process-meeting/${id}`, { rawTranscriptText: transcriptText });
  return response.data;
}

export async function uploadTranscript(id, file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post(`/ai/process-meeting/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function analyzeMeeting(id) {
  const response = await apiClient.post(`/ai/process-meeting/${id}`);
  return response.data;
}

export async function getMeetingAnalysis(id) {
  const response = await apiClient.get(`/meetings/${id}`);
  return response.data;
}

/**
 * Converts extracted meeting action items into real tasks.
 * Exact backend contract: POST /api/ai/meetings/:id/apply-actions
 * Body: { selectedActionIndices: [index], createRisks: false }
 */
export async function createTaskFromActionItem(meetingId, actionIndex) {
  const payload = {};
  if (typeof actionIndex === 'number') {
    payload.selectedActionIndices = [actionIndex];
  } else if (Array.isArray(actionIndex)) {
    payload.selectedActionIndices = actionIndex;
  }
  const response = await apiClient.post(`/ai/meetings/${meetingId}/apply-actions`, payload);
  return response.data;
}

export const meetingsService = {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  saveMeetingNotes,
  processMeeting,
  uploadTranscript,
  analyzeMeeting,
  getMeetingAnalysis,
  createTaskFromActionItem,
};

export default meetingsService;
