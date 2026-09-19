const express = require('express');
const volunteerController = require('../controllers/volunteer.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// Apply authentication to all volunteer routes
router.use(authenticate);

// List and Create
router.get('/', volunteerController.getVolunteers);
router.post('/', volunteerController.createVolunteer);

// Single Volunteer
router.get('/:id', volunteerController.getVolunteerById);
router.put('/:id', volunteerController.updateVolunteer);
router.delete('/:id', authorize('admin', 'organizer'), volunteerController.deleteVolunteer);

module.exports = router;
