/**
<<<<<<< HEAD
 * Events API Client Service (Placeholder Architecture)
 * 
 * Prepares endpoint contracts for the upcoming backend integration phase.
 * Actual HTTP requests via Axios will be activated once Member 2 deploys event routes.
 */

// Placeholder signature for fetching events list with filters
export async function getEvents(params = {}) {
  // To be wired to GET /api/events with Axios in integration phase
  console.info('[API] getEvents called with params:', params);
  return { data: [], total: 0 };
}

// Placeholder signature for fetching single event by ID
export async function getEventById(eventId) {
  // To be wired to GET /api/events/:id with Axios in integration phase
  console.info('[API] getEventById called for eventId:', eventId);
  return { data: null };
}

// Placeholder signature for creating an event
export async function createEvent(eventData) {
  // To be wired to POST /api/events with Axios in integration phase
  console.info('[API] createEvent called with data:', eventData);
  return { success: false, message: 'Backend integration pending' };
}

// Placeholder signature for updating an event
export async function updateEvent(eventId, eventData) {
  // To be wired to PUT /api/events/:id with Axios in integration phase
  console.info('[API] updateEvent called for eventId:', eventId, 'with data:', eventData);
  return { success: false, message: 'Backend integration pending' };
}

// Placeholder signature for deleting an event
export async function deleteEvent(eventId) {
  // To be wired to DELETE /api/events/:id with Axios in integration phase
  console.info('[API] deleteEvent called for eventId:', eventId);
  return { success: false, message: 'Backend integration pending' };
}
=======
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
  // Controller returns { data: events[], pagination }
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
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
