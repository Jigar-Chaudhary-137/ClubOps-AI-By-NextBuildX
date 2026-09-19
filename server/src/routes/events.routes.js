const express = require('express');
const eventController = require('../controllers/event.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// Apply authentication to all event routes
router.use(authenticate);

// List and Create
router.get('/', eventController.getEvents);
router.post('/', authorize('admin', 'organizer'), eventController.createEvent);

// Single Event Details & Aggregated Overview
router.get('/:id/overview', eventController.getEventOverview);
router.get('/:id', eventController.getEventById);

// Update and Delete
router.put('/:id', authorize('admin', 'organizer'), eventController.updateEvent);
router.delete('/:id', authorize('admin', 'organizer'), eventController.deleteEvent);

module.exports = router;
