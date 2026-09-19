/**
 * Documents & Club Knowledge API Client Service
 * Connects document management and RAG pipeline to real backend REST & AI endpoints.
 */

import apiClient from './client';

export async function getDocuments(params = {}) {
  const response = await apiClient.get('/documents', { params });
  return response.data;
}

export async function getDocumentById(id) {
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
}

export async function updateDocument(id, data) {
  const response = await apiClient.put(`/documents/${id}`, data);
  return response.data;
}

export async function deleteDocument(id) {
  const response = await apiClient.delete(`/documents/${id}`);
  return response.data;
}

export async function downloadDocument(id) {
  const response = await apiClient.get(`/documents/${id}`);
  return response.data;
}

export async function processDocument(id) {
  const response = await apiClient.get(`/documents/${id}`);
  return response.data;
}

export async function getDocumentProcessingStatus(id) {
  const response = await apiClient.get(`/documents/${id}`);
  return response.data;
}

export async function addToKnowledge(id) {
  const response = await apiClient.put(`/documents/${id}`, { isKnowledgeBase: true });
  return response.data;
}

export async function removeFromKnowledge(id) {
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
}

export async function getKnowledgeStatus(id) {
  const response = await apiClient.get(`/documents/${id}`);
  return response.data;
}

export const documentsService = {
  getDocuments,
  getDocumentById,
  uploadDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  processDocument,
  getDocumentProcessingStatus,
  addToKnowledge,
  removeFromKnowledge,
  searchKnowledge,
  askKnowledgeAssistant,
  getKnowledgeStatus,
};

export default documentsService;
