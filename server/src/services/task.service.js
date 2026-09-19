const Task = require('../models/Task');
const Event = require('../models/Event');
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const { AppError } = require('../utils/errors');
const { parsePagination, formatPagination, validateObjectId, escapeRegex } = require('../utils/pagination');

/**
 * Creates a new task scoped to the club and verified event.
 */
const createTask = async (clubId, userId, data) => {
  if (!data.title || !data.title.trim()) {
    throw new AppError('Task title is required', 400);
  }

  if (!data.event) {
    throw new AppError('Associated event is required', 400);
  }

  validateObjectId(data.event, 'event ID');
  const event = await Event.findOne({ _id: data.event, club: clubId });
  if (!event) {
    throw new AppError('Event not found or does not belong to your club', 404);
  }

  let assignedUserId = null;
  if (data.assignedTo) {
    validateObjectId(data.assignedTo, 'assigned user ID');
    const assignedUser = await User.findOne({ _id: data.assignedTo, club: clubId });
    if (!assignedUser) {
      throw new AppError('Assigned user must belong to your club', 400);
    }
    assignedUserId = data.assignedTo;
  }

  let volunteerId = null;
  if (data.volunteer) {
    validateObjectId(data.volunteer, 'volunteer ID');
    const volunteer = await Volunteer.findOne({ _id: data.volunteer, club: clubId });
    if (!volunteer) {
      throw new AppError('Volunteer not found or does not belong to your club', 400);
    }
    volunteerId = data.volunteer;
  }

  const task = new Task({
    title: data.title.trim(),
    description: data.description ? data.description.trim() : '',
    status: data.status || 'todo',
    priority: data.priority || 'medium',
    assignedTo: assignedUserId,
    volunteer: volunteerId,
    event: data.event,
    club: clubId,
    dueDate: data.dueDate || null,
    createdBy: userId
  });

  await task.save();

  // Trigger real-time assignment notification
  if (task.assignedTo) {
    try {
      const notificationService = require('./notification.service');
      await notificationService.createNotification({
        recipientId: task.assignedTo,
        clubId,
        eventId: task.event,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned: "${task.title}"`,
        priority: task.priority === 'urgent' ? 'urgent' : (task.priority === 'high' ? 'high' : 'normal'),
        metadata: { taskId: task._id.toString() }
      });
    } catch (err) {
      console.warn('[Task Notification Error]', err.message);
    }
  }

  return task;
};

/**
 * Retrieves tasks with club scoping, filtering, and pagination.
 */
const getTasks = async (clubId, query = {}) => {
  const { page, limit, skip } = parsePagination(query);

  const filter = { club: clubId };

  if (query.event) {
    validateObjectId(query.event, 'event ID');
    filter.event = query.event;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.priority) {
    filter.priority = query.priority;
  }

  if (query.assignedTo) {
    validateObjectId(query.assignedTo, 'assigned user ID');
    filter.assignedTo = query.assignedTo;
  }

  if (query.search) {
    const searchPattern = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ title: searchPattern }, { description: searchPattern }];
  }

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort({ dueDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assignedTo', 'name email avatarUrl role')
      .populate('volunteer', 'department skills availability')
      .populate('event', 'title status startDate endDate')
      .populate('createdBy', 'name email'),
    Task.countDocuments(filter)
  ]);

  return {
    tasks,
    pagination: formatPagination(total, page, limit)
  };
};

/**
 * Retrieves a single task by ID scoped to the club.
 */
const getTaskById = async (clubId, taskId) => {
  validateObjectId(taskId, 'task ID');

  const task = await Task.findOne({ _id: taskId, club: clubId })
    .populate('assignedTo', 'name email avatarUrl role phone')
    .populate('volunteer')
    .populate('event', 'title status startDate endDate')
    .populate('createdBy', 'name email');

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return task;
};

/**
 * Updates a task (Admin/Organizer full edit).
 */
const updateTask = async (clubId, taskId, data) => {
  validateObjectId(taskId, 'task ID');

  const task = await Task.findOne({ _id: taskId, club: clubId });
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const previousAssignee = task.assignedTo ? task.assignedTo.toString() : null;

  if (data.event && data.event.toString() !== task.event.toString()) {
    validateObjectId(data.event, 'event ID');
    const event = await Event.findOne({ _id: data.event, club: clubId });
    if (!event) {
      throw new AppError('Event not found or does not belong to your club', 404);
    }
    task.event = data.event;
  }

  if (data.assignedTo !== undefined) {
    if (data.assignedTo) {
      validateObjectId(data.assignedTo, 'assigned user ID');
      const assignedUser = await User.findOne({ _id: data.assignedTo, club: clubId });
      if (!assignedUser) {
        throw new AppError('Assigned user must belong to your club', 400);
      }
      task.assignedTo = data.assignedTo;
    } else {
      task.assignedTo = null;
    }
  }

  if (data.volunteer !== undefined) {
    if (data.volunteer) {
      validateObjectId(data.volunteer, 'volunteer ID');
      const volunteer = await Volunteer.findOne({ _id: data.volunteer, club: clubId });
      if (!volunteer) {
        throw new AppError('Volunteer not found or does not belong to your club', 400);
      }
      task.volunteer = data.volunteer;
    } else {
      task.volunteer = null;
    }
  }

  if (data.title !== undefined) task.title = data.title.trim();
  if (data.description !== undefined) task.description = data.description.trim();
  if (data.priority !== undefined) task.priority = data.priority;
  if (data.dueDate !== undefined) task.dueDate = data.dueDate;

  if (data.status !== undefined) {
    task.status = data.status;
    if (data.status === 'completed' && !task.completedAt) {
      task.completedAt = new Date();
    } else if (data.status !== 'completed') {
      task.completedAt = null;
    }
  }

  await task.save();

  // Trigger notification if assignment changed
  const newAssignee = task.assignedTo ? task.assignedTo.toString() : null;
  if (newAssignee && newAssignee !== previousAssignee) {
    try {
      const notificationService = require('./notification.service');
      await notificationService.createNotification({
        recipientId: task.assignedTo,
        clubId,
        eventId: task.event,
        type: 'task_assigned',
        title: 'Task Assigned To You',
        message: `You have been assigned: "${task.title}"`,
        priority: task.priority === 'urgent' ? 'urgent' : (task.priority === 'high' ? 'high' : 'normal'),
        metadata: { taskId: task._id.toString() }
      });
    } catch (err) {
      console.warn('[Task Reassignment Notification Error]', err.message);
    }
  }

  return task;
};

/**
 * Updates task status specifically (Admin, Organizer, or Task Assignee).
 */
const updateTaskStatus = async (clubId, user, taskId, status) => {
  validateObjectId(taskId, 'task ID');

  if (!status) {
    throw new AppError('Status is required', 400);
  }

  const validStatuses = ['todo', 'in_progress', 'review', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
  }

  const task = await Task.findOne({ _id: taskId, club: clubId });
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const isOrganizer = ['admin', 'organizer'].includes(user.role);
  const isAssignee = task.assignedTo && task.assignedTo.toString() === user._id.toString();

  if (!isOrganizer && !isAssignee) {
    throw new AppError('You do not have permission to update this task status', 403);
  }

  task.status = status;
  if (status === 'completed') {
    task.completedAt = new Date();
  } else {
    task.completedAt = null;
  }

  await task.save();
  return task;
};

/**
 * Deletes a task.
 */
const deleteTask = async (clubId, taskId) => {
  validateObjectId(taskId, 'task ID');

  const task = await Task.findOneAndDelete({ _id: taskId, club: clubId });
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return { id: taskId, message: 'Task deleted successfully' };
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask
};
