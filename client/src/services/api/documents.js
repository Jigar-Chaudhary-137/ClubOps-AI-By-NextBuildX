/**
 * Documents API Client Service (Placeholder Architecture)
 * 
 * Prepares endpoint contracts for upcoming backend integration phase.
 * Actual HTTP requests via Axios will be activated once document routes are deployed.
 */

// Fetch documents list with optional filters
export async function getDocuments(params = {}) {
  // To be wired to GET /api/documents with Axios in integration phase
  console.info('[API] getDocuments called with params:', params);
  return { data: [], total: 0 };
}

// Fetch single document by ID
export async function getDocumentById(id) {
  // To be wired to GET /api/documents/:id with Axios in integration phase
  console.info('[API] getDocumentById called for id:', id);
  return { data: null };
}

// Upload new document file & metadata
export async function uploadDocument(data) {
  // To be wired to POST /api/documents/upload with Axios in integration phase
  console.info('[API] uploadDocument called with data:', data);
  return { success: false, message: 'Backend integration pending' };
}

// Update document metadata
export async function updateDocument(id, data) {
  // To be wired to PUT /api/documents/:id with Axios in integration phase
  console.info('[API] updateDocument called for id:', id, 'with data:', data);
  return { success: false, message: 'Backend integration pending' };
}

// Delete document
export async function deleteDocument(id) {
  // To be wired to DELETE /api/documents/:id with Axios in integration phase
  console.info('[API] deleteDocument called for id:', id);
  return { success: false, message: 'Backend integration pending' };
}

// Download document file
export async function downloadDocument(id) {
  // To be wired to GET /api/documents/:id/download with Axios in integration phase
  console.info('[API] downloadDocument called for id:', id);
  return { success: false, message: 'Backend integration pending' };
}

// Trigger document text extraction and chunking
export async function processDocument(id) {
  // To be wired to POST /api/documents/:id/process with Axios in integration phase
  console.info('[API] processDocument called for id:', id);
  return { success: false, message: 'Backend integration pending' };
}

// Get document processing status
export async function getDocumentProcessingStatus(id) {
  // To be wired to GET /api/documents/:id/status with Axios in integration phase
  console.info('[API] getDocumentProcessingStatus called for id:', id);
  return { data: { status: 'Not Processed' } };
}

// Add document to Club Knowledge RAG vector store
export async function addToKnowledge(id) {
  // To be wired to POST /api/documents/:id/knowledge/add with Axios in integration phase
  console.info('[API] addToKnowledge called for id:', id);
  return { success: false, message: 'Backend integration pending' };
}

// Remove document from Club Knowledge RAG vector store
export async function removeFromKnowledge(id) {
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
}

// Get document RAG readiness status
export async function getKnowledgeStatus(id) {
  // To be wired to GET /api/documents/:id/knowledge-status with Axios in integration phase
  console.info('[API] getKnowledgeStatus called for id:', id);
  return { data: { readiness: 'Not Added' } };
}
