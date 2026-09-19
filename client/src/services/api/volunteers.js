/**
 * Volunteers API Client Service
 * Connects volunteer management to real backend REST endpoints.
 */

import apiClient from './client';

export async function getVolunteers(params = {}) {
  const response = await apiClient.get('/volunteers', { params });
  return response.data;
}

export async function getVolunteerById(id) {
  const response = await apiClient.get(`/volunteers/${id}`);
  return response.data;
}

export async function createVolunteer(data) {
  const response = await apiClient.post('/volunteers', data);
  return response.data;
}

export async function updateVolunteer(id, data) {
  const response = await apiClient.put(`/volunteers/${id}`, data);
  return response.data;
}

export async function deleteVolunteer(id) {
  const response = await apiClient.delete(`/volunteers/${id}`);
  return response.data;
}

export async function assignVolunteerToEvent(id, eventData) {
  const response = await apiClient.put(`/volunteers/${id}`, eventData);
  return response.data;
}

export async function removeVolunteerFromEvent(id, eventId) {
  const response = await apiClient.put(`/volunteers/${id}`, { event: null });
  return response.data;
}

export async function getVolunteerWorkload(id) {
  const response = await apiClient.get(`/volunteers/${id}`);
  return response.data;
}

export const volunteersService = {
  getVolunteers,
  getVolunteerById,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  assignVolunteerToEvent,
  removeVolunteerFromEvent,
  getVolunteerWorkload,
};

export default volunteersService;
