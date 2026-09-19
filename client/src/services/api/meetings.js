/**
<<<<<<< HEAD
 * Meetings API Client Service (Placeholder Architecture)
 * 
 * Prepares endpoint contracts for upcoming backend integration phase.
 * Actual HTTP requests via Axios will be activated once meeting routes are deployed.
=======
 * Meetings API Client Service
 * Connects meeting operations to real backend REST & AI endpoints.
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
 */

// Fetch meetings list with optional filters
export async function getMeetings(params = {}) {
<<<<<<< HEAD
  // To be wired to GET /api/meetings with Axios in integration phase
  console.info('[API] getMeetings called with params:', params);
  return { data: [], total: 0 };
=======
  const response = await apiClient.get('/meetings', { params });
  return response.data;
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
}

// Fetch single meeting by ID
export async function getMeetingById(id) {
<<<<<<< HEAD
  // To be wired to GET /api/meetings/:id with Axios in integration phase
  console.info('[API] getMeetingById called for id:', id);
  return { data: null };
=======
  const response = await apiClient.get(`/meetings/${id}`);
  return response.data;
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
}

// Create new meeting
export async function createMeeting(data) {
<<<<<<< HEAD
  // To be wired to POST /api/meetings with Axios in integration phase
  console.info('[API] createMeeting called with data:', data);
  return { success: false, message: 'Backend integration pending' };
=======
  const response = await apiClient.post('/meetings', data);
  return response.data;
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
}

// Update meeting
export async function updateMeeting(id, data) {
<<<<<<< HEAD
  // To be wired to PUT /api/meetings/:id with Axios in integration phase
  console.info('[API] updateMeeting called for id:', id, 'with data:', data);
  return { success: false, message: 'Backend integration pending' };
=======
  const response = await apiClient.put(`/meetings/${id}`, data);
  return response.data;
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
}

// Delete meeting
export async function deleteMeeting(id) {
<<<<<<< HEAD
  // To be wired to DELETE /api/meetings/:id with Axios in integration phase
  console.info('[API] deleteMeeting called for id:', id);
  return { success: false, message: 'Backend integration pending' };
=======
  const response = await apiClient.delete(`/meetings/${id}`);
  return response.data;
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
}

// Save meeting notes
export async function saveMeetingNotes(id, data) {
<<<<<<< HEAD
  // To be wired to POST /api/meetings/:id/notes with Axios in integration phase
  console.info('[API] saveMeetingNotes called for id:', id, 'with data:', data);
  return { success: false, message: 'Backend integration pending' };
=======
  const response = await apiClient.put(`/meetings/${id}`, data);
  return response.data;
}

export async function processMeeting(id, transcriptText) {
  const response = await apiClient.post(`/ai/process-meeting/${id}`, { rawTranscriptText: transcriptText });
  return response.data;
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
}

// Upload transcript file
export async function uploadTranscript(id, file) {
<<<<<<< HEAD
  // To be wired to POST /api/meetings/:id/transcript with Axios in integration phase
  console.info('[API] uploadTranscript called for id:', id, 'with file:', file?.name);
  return { success: false, message: 'Backend integration pending' };
=======
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post(`/ai/process-meeting/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
}

// Trigger AI meeting analysis
export async function analyzeMeeting(id) {
<<<<<<< HEAD
  // To be wired to POST /api/meetings/:id/analyze with Axios in integration phase
  console.info('[API] analyzeMeeting called for id:', id);
  return { success: false, message: 'Backend integration pending' };
=======
  const response = await apiClient.post(`/ai/process-meeting/${id}`);
  return response.data;
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
}

// Fetch AI analysis results
export async function getMeetingAnalysis(id) {
<<<<<<< HEAD
  // To be wired to GET /api/meetings/:id/analysis with Axios in integration phase
  console.info('[API] getMeetingAnalysis called for id:', id);
  return { data: null };
}

// Create task from identified action item
export async function createTaskFromActionItem(meetingId, actionItemId) {
  // To be wired to POST /api/meetings/:meetingId/action-items/:actionItemId/create-task
  console.info('[API] createTaskFromActionItem called for meetingId:', meetingId, 'actionItemId:', actionItemId);
  return { success: false, message: 'Backend integration pending' };
}
=======
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
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
