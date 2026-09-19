const express = require('express');
const riskController = require('../controllers/risk.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// Apply authentication to all risk routes
router.use(authenticate);

// List and Create
router.get('/', riskController.getRisks);
router.post('/', authorize('admin', 'organizer'), riskController.createRisk);

// Single Risk
router.get('/:id', riskController.getRiskById);
router.put('/:id', authorize('admin', 'organizer'), riskController.updateRisk);
router.delete('/:id', authorize('admin', 'organizer'), riskController.deleteRisk);

module.exports = router;
