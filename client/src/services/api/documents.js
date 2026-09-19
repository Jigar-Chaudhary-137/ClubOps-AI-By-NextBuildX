/**
<<<<<<< HEAD
 * Documents API Client Service (Placeholder Architecture)
 * 
 * Prepares endpoint contracts for upcoming backend integration phase.
 * Actual HTTP requests via Axios will be activated once document routes are deployed.
=======
 * Documents & Club Knowledge API Client Service
 * Connects document management and RAG pipeline to real backend REST & AI endpoints.
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
 */

// Fetch documents list with optional filters
export async function getDocuments(params = {}) {
<<<<<<< HEAD
  // To be wired to GET /api/documents with Axios in integration phase
  console.info('[API] getDocuments called with params:', params);
  return { data: [], total: 0 };
=======
  const response = await apiClient.get('/documents', { params });
  return response.data;
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
}

// Fetch single document by ID
export async function getDocumentById(id) {
<<<<<<< HEAD
  // To be wired to GET /api/documents/:id with Axios in integration phase
  console.info('[API] getDocumentById called for id:', id);
  return { data: null };
}

// Upload new document file & metadata
export async function uploadDocument(data) {
  // To be wired to POST /api/documents/upload with Axios in integration phase
  console.info('[API] uploadDocument called with data:', data);
  return { success: false, message: 'Backend integration pending' };
=======
  const response = await apiClient.get(`/documents/${id}`);
  return response.data;
}

/**
 * Exact backend contract for document upload:
 * Endpoint: POST /api/documents/upload
 * Field name: 'file' (Multer memory storage)
 * Allowed extensions: .pdf, .txt, .md, .docx, .json
 * Optional fields: title, description, category, event, isKnowledgeBase
 */
export async function uploadDocument(fileOrFormData, metadata = {}) {
  let formData;
  if (fileOrFormData instanceof FormData) {
    formData = fileOrFormData;
  } else {
    formData = new FormData();
    formData.append('file', fileOrFormData);
    if (metadata.title) formData.append('title', metadata.title);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.category) formData.append('category', metadata.category);
    if (metadata.event) formData.append('event', metadata.event);
    if (metadata.isKnowledgeBase !== undefined) {
      formData.append('isKnowledgeBase', String(metadata.isKnowledgeBase));
    }
  }

  const response = await apiClient.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
}

// Update document metadata
export async function updateDocument(id, data) {
<<<<<<< HEAD
  // To be wired to PUT /api/documents/:id with Axios in integration phase
  console.info('[API] updateDocument called for id:', id, 'with data:', data);
  return { success: false, message: 'Backend integration pending' };
=======
  const response = await apiClient.put(`/documents/${id}`, data);
  return response.data;
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
}

// Delete document
export async function deleteDocument(id) {
<<<<<<< HEAD
  // To be wired to DELETE /api/documents/:id with Axios in integration phase
  console.info('[API] deleteDocument called for id:', id);
  return { success: false, message: 'Backend integration pending' };
=======
  const response = await apiClient.delete(`/documents/${id}`);
  return response.data;
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
}

// Download document file
export async function downloadDocument(id) {
<<<<<<< HEAD
  // To be wired to GET /api/documents/:id/download with Axios in integration phase
  console.info('[API] downloadDocument called for id:', id);
  return { success: false, message: 'Backend integration pending' };
=======
  const response = await apiClient.get(`/documents/${id}`);
  return response.data;
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
}

// Trigger document text extraction and chunking
export async function processDocument(id) {
<<<<<<< HEAD
  // To be wired to POST /api/documents/:id/process with Axios in integration phase
  console.info('[API] processDocument called for id:', id);
  return { success: false, message: 'Backend integration pending' };
=======
  const response = await apiClient.get(`/documents/${id}`);
  return response.data;
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
}

// Get document processing status
export async function getDocumentProcessingStatus(id) {
<<<<<<< HEAD
  // To be wired to GET /api/documents/:id/status with Axios in integration phase
  console.info('[API] getDocumentProcessingStatus called for id:', id);
  return { data: { status: 'Not Processed' } };
=======
  const response = await apiClient.get(`/documents/${id}`);
  return response.data;
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
}

// Add document to Club Knowledge RAG vector store
export async function addToKnowledge(id) {
<<<<<<< HEAD
  // To be wired to POST /api/documents/:id/knowledge/add with Axios in integration phase
  console.info('[API] addToKnowledge called for id:', id);
  return { success: false, message: 'Backend integration pending' };
=======
  const response = await apiClient.put(`/documents/${id}`, { isKnowledgeBase: true });
  return response.data;
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
}

// Remove document from Club Knowledge RAG vector store
export async function removeFromKnowledge(id) {
<<<<<<< HEAD
  // To be wired to POST /api/documents/:id/knowledge/remove with Axios in integration phase
  console.info('[API] removeFromKnowledge called for id:', id);
  return { success: false, message: 'Backend integration pending' };
}

// Search Club Knowledge vector embeddings
export async function searchKnowledge(query) {
  // To be wired to POST /api/knowledge/search with Axios in integration phase
  console.info('[API] searchKnowledge called for query:', query);
  return { results: [], total: 0 };
}

// Ask AI Knowledge Assistant using RAG retrieval
export async function askKnowledgeAssistant(query) {
  // To be wired to POST /api/knowledge/ask with Axios in integration phase
  console.info('[API] askKnowledgeAssistant called with query:', query);
  return { answer: null, sources: [] };
=======
  const response = await apiClient.put(`/documents/${id}`, { isKnowledgeBase: false });
  return response.data;
}

export async function searchKnowledge(query, filters = {}) {
  const response = await apiClient.post('/ai/knowledge/search', { query, ...filters });
  return response.data;
}

export async function askKnowledgeAssistant(query, context = {}) {
  const response = await apiClient.post('/ai/knowledge/query', { query, ...context });
  return response.data;
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
}

// Get document RAG readiness status
export async function getKnowledgeStatus(id) {
<<<<<<< HEAD
  // To be wired to GET /api/documents/:id/knowledge-status with Axios in integration phase
  console.info('[API] getKnowledgeStatus called for id:', id);
  return { data: { readiness: 'Not Added' } };
=======
  const response = await apiClient.get(`/documents/${id}`);
  return response.data;
>>>>>>> 9ed121c (integrate events tasks volunteers meetings documents and risks)
}
