const express = require('express');
const announcementController = require('../controllers/announcement.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// Apply authentication to all announcement routes
router.use(authenticate);

// List and Create
router.get('/', announcementController.getAnnouncements);
router.post('/', authorize('admin', 'organizer'), announcementController.createAnnouncement);

// Single Announcement
router.get('/:id', announcementController.getAnnouncementById);
router.put('/:id', authorize('admin', 'organizer'), announcementController.updateAnnouncement);
router.delete('/:id', authorize('admin', 'organizer'), announcementController.deleteAnnouncement);

// Multi-channel Broadcast
router.post('/:id/broadcast', authorize('admin', 'organizer'), announcementController.broadcastAnnouncement);

module.exports = router;
