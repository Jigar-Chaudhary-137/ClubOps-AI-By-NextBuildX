const express = require('express');
const taskController = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// Apply authentication to all task routes
router.use(authenticate);

// List and Create
router.get('/', taskController.getTasks);
router.post('/', authorize('admin', 'organizer'), taskController.createTask);

// Single Task
router.get('/:id', taskController.getTaskById);
router.put('/:id', authorize('admin', 'organizer'), taskController.updateTask);
router.patch('/:id/status', taskController.updateTaskStatus);
router.delete('/:id', authorize('admin', 'organizer'), taskController.deleteTask);

module.exports = router;
