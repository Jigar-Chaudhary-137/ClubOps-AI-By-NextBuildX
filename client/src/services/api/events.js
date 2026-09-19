/**
 * Events API Client Service
 * Uses centralized Axios client. All calls are authenticated via the
 * token interceptor already configured in client.js.
 *
 * Backend response shape:
 *   { success, message, data: <event|event[]>, pagination? }
 */

import apiClient from './client';

/**
 * Fetch a paginated list of events with optional filters.
 * Supported query params (backend): search, status, category, page, limit
 */
export async function getEvents(params = {}) {
  const response = await apiClient.get('/events', { params });
  return response.data;
}

/**
 * Fetch a single event by ID.
 */
export async function getEventById(eventId) {
  const response = await apiClient.get(`/events/${eventId}`);
  return response.data;
}

/**
 * Fetch aggregated operational overview for an event.
 * Returns { event: {...}, metrics: { totalTasks, completedTasks, ... } }
 */
export async function getEventOverview(eventId) {
  const response = await apiClient.get(`/events/${eventId}/overview`);
  return response.data;
}

/**
 * Create a new event.
 * Required: title
 * Optional: description, status, category, startDate, endDate, location, venue, budget, leadOrganizer
 */
export async function createEvent(eventData) {
  const response = await apiClient.post('/events', eventData);
  return response.data;
}

/**
 * Update an existing event by ID.
 * Only sends fields that need to be changed.
 */
export async function updateEvent(eventId, eventData) {
  const response = await apiClient.put(`/events/${eventId}`, eventData);
  return response.data;
}

/**
 * Delete an event by ID.
 */
export async function deleteEvent(eventId) {
  const response = await apiClient.delete(`/events/${eventId}`);
  return response.data;
}

export const eventsService = {
  getEvents,
  getEventById,
  getEventOverview,
  createEvent,
  updateEvent,
  deleteEvent,
};

export default eventsService;
