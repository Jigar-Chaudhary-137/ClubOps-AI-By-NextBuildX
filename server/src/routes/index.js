const express = require('express');

const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const eventsRoutes = require('./events.routes');
const tasksRoutes = require('./tasks.routes');
const volunteersRoutes = require('./volunteers.routes');
const meetingsRoutes = require('./meetings.routes');
const documentsRoutes = require('./documents.routes');
const risksRoutes = require('./risks.routes');
const announcementsRoutes = require('./announcements.routes');
const notificationsRoutes = require('./notifications.routes');
const aiRoutes = require('./ai.routes');

const router = express.Router();

// Mount active and placeholder API routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/events', eventsRoutes);
router.use('/tasks', tasksRoutes);
router.use('/volunteers', volunteersRoutes);
router.use('/meetings', meetingsRoutes);
router.use('/documents', documentsRoutes);
router.use('/risks', risksRoutes);
router.use('/announcements', announcementsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
