/**
 * Tasks API Client Service
 * Uses centralized Axios client.
 */

import apiClient from './client';

export async function getTasks(params = {}) {
  const response = await apiClient.get('/tasks', { params });
  return response.data;
}

export async function getTaskById(taskId) {
  const response = await apiClient.get(`/tasks/${taskId}`);
  return response.data;
}

export async function createTask(taskData) {
  const response = await apiClient.post('/tasks', taskData);
  return response.data;
}

export async function updateTask(taskId, taskData) {
  const response = await apiClient.put(`/tasks/${taskId}`, taskData);
  return response.data;
}

export async function updateTaskStatus(taskId, status) {
  const response = await apiClient.patch(`/tasks/${taskId}/status`, { status });
  return response.data;
}

export async function assignTask(taskId, userId) {
  const response = await apiClient.put(`/tasks/${taskId}`, { assignedTo: userId });
  return response.data;
}

export async function deleteTask(taskId) {
  const response = await apiClient.delete(`/tasks/${taskId}`);
  return response.data;
}

export const tasksService = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  assignTask,
  deleteTask,
};

export default tasksService;
