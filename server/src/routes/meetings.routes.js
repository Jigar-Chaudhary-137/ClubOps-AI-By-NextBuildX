const express = require('express');
const meetingController = require('../controllers/meeting.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// Apply authentication to all meeting routes
router.use(authenticate);

// List and Create
router.get('/', meetingController.getMeetings);
router.post('/', authorize('admin', 'organizer'), meetingController.createMeeting);

// Single Meeting
router.get('/:id', meetingController.getMeetingById);
router.put('/:id', authorize('admin', 'organizer'), meetingController.updateMeeting);
router.delete('/:id', authorize('admin', 'organizer'), meetingController.deleteMeeting);

module.exports = router;
