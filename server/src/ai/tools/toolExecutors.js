const taskService = require('../../services/task.service');
const eventService = require('../../services/event.service');
const riskService = require('../../services/risk.service');
const announcementService = require('../../services/announcement.service');
const volunteerService = require('../../services/volunteer.service');
const User = require('../../models/User');
const Event = require('../../models/Event');
const Task = require('../../models/Task');
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
    validateObjectId(args.eventId, 'event ID');

    // Verify event belongs to club
    const event = await Event.findOne({ _id: args.eventId, club: clubId });
    if (!event) {
      return {
        tool: 'create_task',
        success: false,
        error: { code: 'EVENT_NOT_FOUND', message: 'Event not found or does not belong to your club' }
      };
    }

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
            eventId: args.eventId,
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
        event: args.eventId,
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
  }
};

module.exports = {
  toolExecutors,
  resolveAssignee
};

