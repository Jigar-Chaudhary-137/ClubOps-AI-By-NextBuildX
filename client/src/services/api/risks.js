/**
 * Risks API Client Service
 * Connects operational risk management to real backend REST & AI endpoints.
 */

import apiClient from './client';

export async function getRisks(params = {}) {
  const response = await apiClient.get('/risks', { params });
  return response.data;
}

export async function getRiskById(id) {
  const response = await apiClient.get(`/risks/${id}`);
  return response.data;
}

export async function createRisk(data) {
  const response = await apiClient.post('/risks', data);
  return response.data;
}

export async function updateRisk(id, data) {
  const response = await apiClient.put(`/risks/${id}`, data);
  return response.data;
}

export async function deleteRisk(id) {
  const response = await apiClient.delete(`/risks/${id}`);
  return response.data;
}

export async function updateRiskStatus(id, status) {
  const response = await apiClient.put(`/risks/${id}`, { status });
  return response.data;
}

export async function assignRiskOwner(id, ownerId) {
  const response = await apiClient.put(`/risks/${id}`, { owner: ownerId });
  return response.data;
}

export async function updateMitigationPlan(id, plan) {
  const response = await apiClient.put(`/risks/${id}`, { mitigationPlan: plan });
  return response.data;
}

export async function addMitigationAction(id, action) {
  const response = await apiClient.put(`/risks/${id}`, { action });
  return response.data;
}

export async function updateMitigationAction(riskId, actionId, actionData) {
  const response = await apiClient.put(`/risks/${riskId}`, actionData);
  return response.data;
}

export async function deleteMitigationAction(riskId, actionId) {
  const response = await apiClient.get(`/risks/${riskId}`);
  return response.data;
}

export async function analyzeRisk(eventId) {
  const response = await apiClient.post(`/ai/analyze-risks/${eventId || 'all'}`);
  return response.data;
}

export async function analyzeAllRisks(params = {}) {
  const eventId = params.eventId || 'all';
  const response = await apiClient.post(`/ai/analyze-risks/${eventId}`);
  return response.data;
}

export async function getRiskInsights(params = {}) {
  const response = await apiClient.get('/risks', { params });
  return response.data;
}

export async function getRiskTimeline(id) {
  const response = await apiClient.get(`/risks/${id}`);
  return response.data;
}

export const risksService = {
  getRisks,
  getRiskById,
  createRisk,
  updateRisk,
  deleteRisk,
  updateRiskStatus,
  assignRiskOwner,
  updateMitigationPlan,
  addMitigationAction,
  updateMitigationAction,
  deleteMitigationAction,
  analyzeRisk,
  analyzeAllRisks,
  getRiskInsights,
  getRiskTimeline,
};

export default risksService;
