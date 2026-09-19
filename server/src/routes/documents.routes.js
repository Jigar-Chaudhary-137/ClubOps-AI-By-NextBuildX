const express = require('express');
const documentController = require('../controllers/document.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// Apply authentication to all document routes
router.use(authenticate);

// List and Create
router.get('/', documentController.getDocuments);
router.post('/', authorize('admin', 'organizer'), documentController.createDocument);

// Single Document
router.get('/:id', documentController.getDocumentById);
router.put('/:id', authorize('admin', 'organizer'), documentController.updateDocument);
router.delete('/:id', authorize('admin', 'organizer'), documentController.deleteDocument);

module.exports = router;
