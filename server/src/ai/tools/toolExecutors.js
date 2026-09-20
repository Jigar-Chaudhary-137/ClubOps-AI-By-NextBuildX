const taskService = require('../../services/task.service');
const eventService = require('../../services/event.service');
const riskService = require('../../services/risk.service');
const announcementService = require('../../services/announcement.service');
const volunteerService = require('../../services/volunteer.service');
const User = require('../../models/User');
const Event = require('../../models/Event');
const Task = require('../../models/Task');
const Risk = require('../../models/Risk');
const Meeting = require('../../models/Meeting');
const Volunteer = require('../../models/Volunteer');
const { resolveMemberOwner } = require('../extraction/meetingProcessor');
const { validateObjectId } = require('../../utils/pagination');
const { AppError } = require('../../utils/errors');

/**
 * Resolves an assignee identifier (either direct userId or natural name).
 */
const resolveAssignee = async (clubId, { userId, assignedToName }) => {
  if (userId) {
    validateObjectId(userId, 'user ID');
    const user = await User.findOne({ _id: userId, club: clubId, isActive: true });
    if (!user) {
      return { resolvedUserId: null, error: { code: 'USER_NOT_FOUND', message: 'Assigned user does not belong to your club' } };
    }
    return { resolvedUserId: user._id, resolvedName: user.name };
  }

  if (assignedToName) {
    const clubMembers = await User.find({ club: clubId, isActive: true }).select('_id name email role').lean();
    const resolution = resolveMemberOwner(assignedToName, clubMembers);

    if (resolution.matchType === 'ambiguous') {
      return {
        resolvedUserId: null,
        error: {
          code: 'AMBIGUOUS_ASSIGNEE',
          message: `Multiple club members match the name "${assignedToName}". Please specify the full name.`,
          possibleMatches: resolution.possibleMatches
        }
      };
    }

    if (!resolution.suggestedUserId) {
      return {
        resolvedUserId: null,
        error: {
          code: 'ASSIGNEE_NOT_FOUND',
          message: `No active club member found matching "${assignedToName}".`
        }
      };
    }

    return { resolvedUserId: resolution.suggestedUserId, resolvedName: resolution.matchedName };
  }

  return { resolvedUserId: null };
};

const toolExecutors = {
  // 1. Create Task Executor
  create_task: async (args, context) => {
    const { clubId, user, dryRun } = context;
    let resolvedEvent = null;

    if (args.eventId) {
      if (/^[0-9a-fA-F]{24}$/.test(args.eventId)) {
        resolvedEvent = await Event.findOne({ _id: args.eventId, club: clubId });
      } else {
        // Match by title
        resolvedEvent = await Event.findOne({ club: clubId, title: new RegExp(args.eventId, 'i') });
      }
    } else if (args.title) {
      // Check if task title mentions an existing event name in this club
      const clubEvents = await Event.find({ club: clubId }).select('_id title').lean();
      for (const ev of clubEvents) {
        if (args.title.toLowerCase().includes(ev.title.toLowerCase().split(' ')[0])) {
          resolvedEvent = ev;
          break;
        }
      }
    }

    const eventId = resolvedEvent ? resolvedEvent._id : null;

    let assignedUserId = null;
    let resolvedName = null;
    if (args.userId || args.assignedToName) {
      const resolution = await resolveAssignee(clubId, { userId: args.userId, assignedToName: args.assignedToName });
      if (resolution.error) {
        return { tool: 'create_task', success: false, error: resolution.error };
      }
      assignedUserId = resolution.resolvedUserId;
      resolvedName = resolution.resolvedName;
    }

    if (dryRun) {
      return {
        tool: 'create_task',
        success: true,
        dryRun: true,
        action: 'Simulated task creation',
        resource: {
          type: 'task',
          preview: {
            title: args.title,
            description: args.description || '',
            priority: args.priority || 'medium',
            assignedTo: resolvedName || 'Unassigned',
            eventId: eventId ? eventId.toString() : null,
            dueDate: args.dueDate || null
          }
        }
      };
    }

    try {
      const task = await taskService.createTask(clubId, user._id, {
        title: args.title,
        description: args.description,
        priority: args.priority || 'medium',
        assignedTo: assignedUserId,
        event: eventId,
        dueDate: args.dueDate || null
      });

      return {
        tool: 'create_task',
        success: true,
        action: 'Created task',
        resource: {
          type: 'task',
          id: task._id,
          title: task.title,
          priority: task.priority,
          assignedTo: resolvedName || null
        }
      };
    } catch (err) {
      return {
        tool: 'create_task',
        success: false,
        error: { code: 'TASK_CREATION_FAILED', message: err.message }
      };
    }
  },

  // 2. Update Task Status Executor
  update_task_status: async (args, context) => {
    const { clubId, user, dryRun } = context;
    validateObjectId(args.taskId, 'task ID');

    if (dryRun) {
      const task = await Task.findOne({ _id: args.taskId, club: clubId });
      if (!task) {
        return { tool: 'update_task_status', success: false, error: { code: 'TASK_NOT_FOUND', message: 'Task not found in your club' } };
      }
      return {
        tool: 'update_task_status',
        success: true,
        dryRun: true,
        action: `Simulated task status update to ${args.status}`,
        resource: { type: 'task', id: args.taskId, proposedStatus: args.status }
      };
    }

    try {
      const updated = await taskService.updateTaskStatus(clubId, user, args.taskId, args.status);
      return {
        tool: 'update_task_status',
        success: true,
        action: `Updated task status to ${args.status}`,
        resource: {
          type: 'task',
          id: updated._id,
          title: updated.title,
          status: updated.status,
          completedAt: updated.completedAt
        }
      };
    } catch (err) {
      return {
        tool: 'update_task_status',
        success: false,
        error: { code: 'STATUS_UPDATE_FAILED', message: err.message }
      };
    }
  },

  // 3. Assign Task Executor
  assign_task: async (args, context) => {
    const { clubId, user, dryRun } = context;
    validateObjectId(args.taskId, 'task ID');

    const resolution = await resolveAssignee(clubId, { userId: args.userId, assignedToName: args.assigneeName });
    if (resolution.error) {
      return { tool: 'assign_task', success: false, error: resolution.error };
    }

    if (dryRun) {
      return {
        tool: 'assign_task',
        success: true,
        dryRun: true,
        action: `Simulated assignment to ${resolution.resolvedName}`,
        resource: { type: 'task', id: args.taskId, assignedTo: resolution.resolvedName }
      };
    }

    try {
      const updated = await taskService.updateTask(clubId, args.taskId, { assignedTo: resolution.resolvedUserId });
      return {
        tool: 'assign_task',
        success: true,
        action: `Assigned task to ${resolution.resolvedName}`,
        resource: {
          type: 'task',
          id: updated._id,
          title: updated.title,
          assignedTo: resolution.resolvedName
        }
      };
    } catch (err) {
      return {
        tool: 'assign_task',
        success: false,
        error: { code: 'ASSIGNMENT_FAILED', message: err.message }
      };
    }
  },

  // 4. Create Risk Executor
  create_risk: async (args, context) => {
    const { clubId, user, dryRun } = context;
    validateObjectId(args.eventId, 'event ID');

    if (dryRun) {
      return {
        tool: 'create_risk',
        success: true,
        dryRun: true,
        action: 'Simulated risk entry creation',
        resource: {
          type: 'risk',
          preview: {
            title: args.title,
            severity: args.severity,
            probability: args.probability || 'medium',
            mitigationPlan: args.mitigationPlan
          }
        }
      };
    }

    try {
      const risk = await riskService.createRisk(clubId, user._id, {
        title: args.title,
        description: args.description || '',
        severity: args.severity || 'medium',
        probability: args.probability || 'medium',
        mitigationPlan: args.mitigationPlan,
        event: args.eventId
      });

      return {
        tool: 'create_risk',
        success: true,
        action: 'Created risk record',
        resource: {
          type: 'risk',
          id: risk._id,
          title: risk.title,
          severity: risk.severity,
          mitigationPlan: risk.mitigationPlan
        }
      };
    } catch (err) {
      return {
        tool: 'create_risk',
        success: false,
        error: { code: 'RISK_CREATION_FAILED', message: err.message }
      };
    }
  },

  // 5. Create Announcement Executor
  create_announcement: async (args, context) => {
    const { clubId, user, dryRun } = context;

    if (dryRun) {
      return {
        tool: 'create_announcement',
        success: true,
        dryRun: true,
        action: 'Simulated announcement creation',
        resource: {
          type: 'announcement',
          preview: {
            title: args.title,
            targetAudience: args.targetAudience || 'all',
            priority: args.priority || 'normal',
            content: args.content
          }
        }
      };
    }

    try {
      const announcement = await announcementService.createAnnouncement(clubId, user._id, {
        title: args.title,
        content: args.content,
        targetAudience: args.targetAudience || 'all',
        priority: args.priority || 'normal',
        status: 'draft', // Safety default for AI generated announcements
        event: args.eventId || null
      });

      return {
        tool: 'create_announcement',
        success: true,
        action: 'Created announcement draft',
        resource: {
          type: 'announcement',
          id: announcement._id,
          title: announcement.title,
          targetAudience: announcement.targetAudience,
          status: announcement.status
        }
      };
    } catch (err) {
      return {
        tool: 'create_announcement',
        success: false,
        error: { code: 'ANNOUNCEMENT_CREATION_FAILED', message: err.message }
      };
    }
  },

  // 6. Get Event Status Executor (Read-Only)
  get_event_status: async (args, context) => {
    const { clubId } = context;
    validateObjectId(args.eventId, 'event ID');

    try {
      const overview = await eventService.getEventOverview(clubId, args.eventId);
      return {
        tool: 'get_event_status',
        success: true,
        data: overview
      };
    } catch (err) {
      return {
        tool: 'get_event_status',
        success: false,
        error: { code: 'EVENT_STATUS_FAILED', message: err.message }
      };
    }
  },

  // 7. List Unassigned Tasks Executor (Read-Only)
  list_unassigned_tasks: async (args, context) => {
    const { clubId } = context;
    validateObjectId(args.eventId, 'event ID');

    try {
      const unassignedTasks = await Task.find({
        club: clubId,
        event: args.eventId,
        assignedTo: null,
        status: { $ne: 'completed' }
      })
        .select('_id title priority dueDate status')
        .sort({ priority: -1, dueDate: 1 })
        .limit(10)
        .lean();

      return {
        tool: 'list_unassigned_tasks',
        success: true,
        count: unassignedTasks.length,
        tasks: unassignedTasks
      };
    } catch (err) {
      return {
        tool: 'list_unassigned_tasks',
        success: false,
        error: { code: 'LOOKUP_FAILED', message: err.message }
      };
    }
  },

  // 8. List Available Volunteers Executor (Read-Only)
  list_available_volunteers: async (args, context) => {
    const { clubId } = context;

    try {
      const query = { availability: 'available' };
      if (args.department) {
        query.department = args.department;
      }

      const result = await volunteerService.getVolunteers(clubId, { ...query, limit: 15 });
      const sanitized = result.volunteers.map((v) => ({
        id: v._id,
        name: v.user ? v.user.name : 'Unknown',
        role: v.user ? v.user.role : 'volunteer',
        department: v.department,
        skills: v.skills,
        availability: v.availability
      }));

      return {
        tool: 'list_available_volunteers',
        success: true,
        count: sanitized.length,
        volunteers: sanitized
      };
    } catch (err) {
      return {
        tool: 'list_available_volunteers',
        success: false,
        error: { code: 'LOOKUP_FAILED', message: err.message }
      };
    }
  },

  // 9. Search Club Knowledge Base (Read-Only RAG Tool)
  search_club_knowledge: async (args, context) => {
    const { clubId } = context;
    const { searchKnowledge } = require('../rag/ragEngine');

    try {
      if (!args.query || !args.query.trim()) {
        return {
          tool: 'search_club_knowledge',
          success: false,
          error: { code: 'INVALID_QUERY', message: 'Search query cannot be empty' }
        };
      }

      let eventId = null;
      if (args.eventId) {
        validateObjectId(args.eventId, 'event ID');
        const event = await Event.findOne({ _id: args.eventId, club: clubId });
        if (!event) {
          return {
            tool: 'search_club_knowledge',
            success: false,
            error: { code: 'EVENT_NOT_FOUND', message: 'Event not found or does not belong to your club' }
          };
        }
        eventId = args.eventId;
      }

      const chunks = await searchKnowledge({
        clubId,
        query: args.query.trim(),
        eventId,
        topK: 5
      });

      const sanitizedResults = chunks.map((c) => ({
        documentId: c.documentId,
        title: c.title,
        pageNumber: c.pageNumber,
        chunkIndex: c.chunkIndex,
        similarity: c.similarity,
        category: c.category,
        snippet: c.snippet
      }));

      return {
        tool: 'search_club_knowledge',
        success: true,
        count: sanitizedResults.length,
        results: sanitizedResults
      };
    } catch (err) {
      return {
        tool: 'search_club_knowledge',
        success: false,
        error: { code: 'SEARCH_FAILED', message: err.message }
      };
    }
  },

  // 10. Send Broadcast Alert (Mutation Tool)
  send_broadcast_alert: async (args, context) => {
    const { clubId, user, dryRun } = context;
    const broadcastService = require('../../services/broadcast.service');
    const announcementService = require('../../services/announcement.service');

    try {
      if (!args.title || !args.title.trim()) {
        return {
          tool: 'send_broadcast_alert',
          success: false,
          error: { code: 'INVALID_TITLE', message: 'Alert title is required' }
        };
      }

      if (!args.message || !args.message.trim()) {
        return {
          tool: 'send_broadcast_alert',
          success: false,
          error: { code: 'INVALID_MESSAGE', message: 'Alert message is required' }
        };
      }

      let eventId = null;
      if (args.eventId) {
        validateObjectId(args.eventId, 'event ID');
        const event = await Event.findOne({ _id: args.eventId, club: clubId });
        if (!event) {
          return {
            tool: 'send_broadcast_alert',
            success: false,
            error: { code: 'EVENT_NOT_FOUND', message: 'Event not found or does not belong to your club' }
          };
        }
        eventId = args.eventId;
      }

      const targetAudience = args.audience || 'volunteers';
      const requestedChannels = Array.isArray(args.channels) && args.channels.length > 0 ? args.channels : ['in_app'];

      // Resolve candidate recipients
      const recipients = await broadcastService.resolveAudienceRecipients(clubId, targetAudience);

      if (dryRun) {
        return {
          tool: 'send_broadcast_alert',
          success: true,
          dryRun: true,
          action: 'Simulated broadcast alert dispatch',
          wouldSend: {
            title: args.title.trim(),
            message: args.message.trim(),
            audience: targetAudience,
            channels: requestedChannels,
            targetRecipientsCount: recipients.length,
            eventId
          }
        };
      }

      // Create announcement
      const announcement = await announcementService.createAnnouncement(clubId, user._id, {
        title: args.title.trim(),
        content: args.message.trim(),
        priority: args.priority || 'urgent',
        targetAudience,
        event: eventId
      });

      // Dispatch broadcast
      const broadcastResult = await broadcastService.broadcastAnnouncement(
        clubId,
        user._id,
        announcement._id,
        requestedChannels
      );

      return {
        tool: 'send_broadcast_alert',
        success: true,
        action: 'Broadcast alert sent successfully',
        resource: {
          type: 'announcement',
          id: announcement._id.toString()
        },
        summary: broadcastResult.summary
      };
    } catch (err) {
      return {
        tool: 'send_broadcast_alert',
        success: false,
        error: { code: 'BROADCAST_FAILED', message: err.message }
      };
    }
  },

  // Alias for broadcast_announcement
  broadcast_announcement: async (args, context) => {
    return toolExecutors.send_broadcast_alert(args, context);
  },

  // 11. List Events Executor (Read-Only Workspace Tool)
  list_events: async (args = {}, context) => {
    const { clubId } = context;
    try {
      const query = { club: clubId };
      if (args.status && args.status !== 'all') {
        query.status = args.status;
      }
      if (args.upcomingOnly) {
        // Events starting today onwards, or active/planning events
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        query.$or = [
          { startDate: { $gte: startOfToday } },
          { status: { $in: ['planning', 'ready', 'active'] } }
        ];
      }

      const limit = Math.min(parseInt(args.limit, 10) || 10, 25);
      const events = await Event.find(query)
        .select('_id title description status startDate endDate location venue category leadOrganizer budget')
        .sort({ startDate: 1, createdAt: -1 })
        .limit(limit)
        .lean();

      return {
        tool: 'list_events',
        success: true,
        count: events.length,
        events: events.map((ev) => ({
          _id: ev._id.toString(),
          title: ev.title,
          description: ev.description || '',
          status: ev.status,
          startDate: ev.startDate ? new Date(ev.startDate).toISOString() : null,
          endDate: ev.endDate ? new Date(ev.endDate).toISOString() : null,
          location: ev.location || (ev.venue?.name ? ev.venue.name : 'TBD'),
          category: ev.category || 'General',
          budget: ev.budget || null
        }))
      };
    } catch (err) {
      return {
        tool: 'list_events',
        success: false,
        error: { code: 'LIST_EVENTS_FAILED', message: err.message }
      };
    }
  },

  // 12. List Tasks Executor (Read-Only Workspace Tool)
  list_tasks: async (args = {}, context) => {
    const { clubId } = context;
    try {
      const query = { club: clubId };

      if (args.status) {
        if (args.status === 'pending') {
          query.status = { $in: ['todo', 'in_progress', 'review'] };
        } else {
          query.status = args.status;
        }
      }

      if (args.priority) {
        query.priority = args.priority;
      }

      if (args.eventId) {
        validateObjectId(args.eventId, 'event ID');
        query.event = args.eventId;
      }

      if (args.upcomingDeadlinesOnly) {
        query.status = { $ne: 'completed' };
        query.dueDate = { $ne: null };
      }

      const limit = Math.min(parseInt(args.limit, 10) || 15, 50);
      const sort = args.upcomingDeadlinesOnly ? { dueDate: 1 } : { priority: -1, dueDate: 1, createdAt: -1 };

      const tasks = await Task.find(query)
        .populate('assignedTo', '_id name email role')
        .populate('event', '_id title startDate')
        .sort(sort)
        .limit(limit)
        .lean();

      return {
        tool: 'list_tasks',
        success: true,
        count: tasks.length,
        tasks: tasks.map((t) => ({
          _id: t._id.toString(),
          title: t.title,
          description: t.description || '',
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : null,
          event: t.event ? { _id: t.event._id.toString(), title: t.event.title } : null,
          assignedTo: t.assignedTo ? { _id: t.assignedTo._id.toString(), name: t.assignedTo.name, role: t.assignedTo.role } : null
        }))
      };
    } catch (err) {
      return {
        tool: 'list_tasks',
        success: false,
        error: { code: 'LIST_TASKS_FAILED', message: err.message }
      };
    }
  },

  // 13. List Risks Executor (Read-Only Workspace Tool)
  list_risks: async (args = {}, context) => {
    const { clubId } = context;
    try {
      const query = { club: clubId };

      if (args.eventId) {
        validateObjectId(args.eventId, 'event ID');
        query.event = args.eventId;
      }

      if (args.severity) {
        query.severity = args.severity;
      }

      if (args.status) {
        query.status = args.status;
      }

      const limit = Math.min(parseInt(args.limit, 10) || 10, 25);
      const risks = await Risk.find(query)
        .populate('event', '_id title')
        .sort({ severity: -1, createdAt: -1 })
        .limit(limit)
        .lean();

      return {
        tool: 'list_risks',
        success: true,
        count: risks.length,
        risks: risks.map((r) => ({
          _id: r._id.toString(),
          title: r.title,
          description: r.description || '',
          severity: r.severity,
          probability: r.probability || 'medium',
          status: r.status,
          mitigationPlan: r.mitigationPlan || '',
          event: r.event ? { _id: r.event._id.toString(), title: r.event.title } : null
        }))
      };
    } catch (err) {
      return {
        tool: 'list_risks',
        success: false,
        error: { code: 'LIST_RISKS_FAILED', message: err.message }
      };
    }
  },

  // 14. List Meetings Executor (Read-Only Workspace Tool)
  list_meetings: async (args = {}, context) => {
    const { clubId } = context;
    try {
      const query = { club: clubId };

      if (args.eventId) {
        validateObjectId(args.eventId, 'event ID');
        query.event = args.eventId;
      }

      const limit = Math.min(parseInt(args.limit, 10) || 5, 20);
      const meetings = await Meeting.find(query)
        .populate('event', '_id title')
        .sort({ scheduledAt: -1, createdAt: -1 })
        .limit(limit)
        .lean();

      return {
        tool: 'list_meetings',
        success: true,
        count: meetings.length,
        meetings: meetings.map((m) => ({
          _id: m._id.toString(),
          title: m.title,
          type: m.type || 'Planning',
          scheduledAt: m.scheduledAt ? new Date(m.scheduledAt).toISOString() : null,
          agenda: m.agenda || [],
          notes: m.notes ? m.notes.slice(0, 500) : '',
          extractedItems: Array.isArray(m.extractedItems) ? m.extractedItems.map((item) => ({
            title: item.title,
            assignedTo: item.assignedTo,
            deadline: item.deadline,
            priority: item.priority,
            applied: item.applied
          })) : [],
          event: m.event ? { _id: m.event._id.toString(), title: m.event.title } : null
        }))
      };
    } catch (err) {
      return {
        tool: 'list_meetings',
        success: false,
        error: { code: 'LIST_MEETINGS_FAILED', message: err.message }
      };
    }
  },

  // 15. List Volunteers Executor (Read-Only Workspace Tool)
  list_volunteers: async (args = {}, context) => {
    const { clubId } = context;
    try {
      const query = { club: clubId };

      if (args.department) {
        query.department = new RegExp(args.department, 'i');
      }

      if (args.availability) {
        query.availability = args.availability;
      }

      const limit = Math.min(parseInt(args.limit, 10) || 15, 50);
      const volunteers = await Volunteer.find(query)
        .populate('user', '_id name email role')
        .populate('event', '_id title')
        .lean();

      // Aggregate live active task counts per assigned user in this club
      const activeTasksAggregation = await Task.aggregate([
        { $match: { club: clubId, status: { $in: ['todo', 'in_progress', 'review'] }, assignedTo: { $ne: null } } },
        { $group: { _id: '$assignedTo', activeCount: { $sum: 1 } } }
      ]);
      const taskCountMap = {};
      activeTasksAggregation.forEach((entry) => {
        taskCountMap[entry._id.toString()] = entry.activeCount;
      });

      const enriched = volunteers.map((v) => {
        const userIdStr = v.user?._id?.toString();
        const liveActiveTasks = userIdStr && taskCountMap[userIdStr] ? taskCountMap[userIdStr] : 0;
        const totalWorkload = Math.max(v.assignedTasksCount || 0, liveActiveTasks);

        return {
          _id: v._id.toString(),
          user: v.user ? { _id: v.user._id.toString(), name: v.user.name, email: v.user.email, role: v.user.role } : null,
          department: v.department || 'General',
          availability: v.availability || 'available',
          skills: v.skills || [],
          assignedTasksCount: totalWorkload,
          activeTasksCount: liveActiveTasks,
          event: v.event ? { _id: v.event._id.toString(), title: v.event.title } : null
        };
      });

      if (args.sortByWorkload) {
        enriched.sort((a, b) => b.assignedTasksCount - a.assignedTasksCount);
      }

      return {
        tool: 'list_volunteers',
        success: true,
        count: enriched.slice(0, limit).length,
        volunteers: enriched.slice(0, limit)
      };
    } catch (err) {
      return {
        tool: 'list_volunteers',
        success: false,
        error: { code: 'LIST_VOLUNTEERS_FAILED', message: err.message }
      };
    }
  }
};

module.exports = {
  toolExecutors,
  resolveAssignee
};

