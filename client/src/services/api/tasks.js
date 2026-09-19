/**
<<<<<<< HEAD
 * Tasks API Client Service (Placeholder Architecture)
 * 
 * Prepares endpoint contracts for the upcoming backend integration phase.
 * Actual HTTP requests via Axios will be activated once Member 2 deploys task routes.
=======
 * Tasks API Client Service
 * Uses centralized Axios client.
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
 */

// Placeholder signature for fetching tasks list with filters (status, priority, event, assignee)
export async function getTasks(params = {}) {
  const response = await apiClient.get('/tasks', { params });
  return response.data;
}

// Placeholder signature for fetching single task by ID
export async function getTaskById(taskId) {
  const response = await apiClient.get(`/tasks/${taskId}`);
  return response.data;
}

// Placeholder signature for creating a task
export async function createTask(taskData) {
  const response = await apiClient.post('/tasks', taskData);
  return response.data;
}

// Placeholder signature for updating a task
export async function updateTask(taskId, taskData) {
  const response = await apiClient.put(`/tasks/${taskId}`, taskData);
  return response.data;
}

// Placeholder signature for updating task status (e.g. Kanban move)
export async function updateTaskStatus(taskId, status) {
  const response = await apiClient.patch(`/tasks/${taskId}/status`, { status });
  return response.data;
}

// Placeholder signature for assigning task to a member
export async function assignTask(taskId, userId) {
  const response = await apiClient.put(`/tasks/${taskId}`, { assignedTo: userId });
  return response.data;
}

// Placeholder signature for deleting a task
export async function deleteTask(taskId) {
  const response = await apiClient.delete(`/tasks/${taskId}`);
  return response.data;
}
