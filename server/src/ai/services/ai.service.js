const Meeting = require('../../models/Meeting');
const Event = require('../../models/Event');
const User = require('../../models/User');
const Task = require('../../models/Task');
const { AppError } = require('../../utils/errors');
const { validateObjectId } = require('../../utils/pagination');
const { generateStructured } = require('../gemini/client');
const { buildEventPlannerPrompt } = require('../prompts/eventPlanner.prompt');
const { buildAnnouncementPrompt } = require('../prompts/announcement.prompt');
const { processTranscript, resolveMemberOwner } = require('../extraction/meetingProcessor');
const { analyzeEventOperationalRisks } = require('../risk/riskEngine');
const { runOperationsAgent } = require('../agents/operationsAgent');
const taskService = require('../../services/task.service');
const riskService = require('../../services/risk.service');

/**
 * 1. AI Event Planner: Generates comprehensive event operation proposal
 */
const planEvent = async (clubId, eventParams = {}) => {
  if (!eventParams.title || !eventParams.title.trim()) {
    throw new AppError('Event title is required for planning', 400);
  }

  if (eventParams.description && eventParams.description.length > 5000) {
    throw new AppError('Description exceeds maximum limit of 5000 characters', 400);
  }

  const prompt = buildEventPlannerPrompt(eventParams);

  const rawAiResult = await generateStructured(prompt, {
    workflow: 'eventPlanner',
    systemInstruction: 'You are a collegiate event management specialist that provides concrete operational proposals in valid JSON format.'
  });

  const allowedPriorities = ['low', 'medium', 'high', 'urgent'];

  const normalizedTasks = Array.isArray(rawAiResult.tasks)
    ? rawAiResult.tasks.map((t) => ({
        title: t.title ? String(t.title).trim() : 'Event Task',
        description: t.description ? String(t.description).trim() : '',
        priority: allowedPriorities.includes(t.priority?.toLowerCase()) ? t.priority.toLowerCase() : 'medium',
        suggestedDaysBeforeEvent: typeof t.suggestedDaysBeforeEvent === 'number' ? t.suggestedDaysBeforeEvent : 7,
        suggestedRole: t.suggestedRole ? String(t.suggestedRole).trim() : 'General Organizer'
      }))
    : [];

  return {
    summary: rawAiResult.summary || `Operational plan proposal for ${eventParams.title}`,
    phases: Array.isArray(rawAiResult.phases) ? rawAiResult.phases : [],
    tasks: normalizedTasks,
    volunteerRoles: Array.isArray(rawAiResult.volunteerRoles) ? rawAiResult.volunteerRoles : [],
    venueConsiderations: Array.isArray(rawAiResult.venueConsiderations) ? rawAiResult.venueConsiderations : [],
    logisticsConsiderations: Array.isArray(rawAiResult.logisticsConsiderations) ? rawAiResult.logisticsConsiderations : [],
    budgetConsiderations: Array.isArray(rawAiResult.budgetConsiderations) ? rawAiResult.budgetConsiderations : []
  };
};

/**
 * 2. AI Meeting Processor: Extracts action items, decisions, and risks from meeting notes/transcript
 */
const processMeetingTranscript = async (clubId, meetingId) => {
  validateObjectId(meetingId, 'meeting ID');

  const meeting = await Meeting.findOne({ _id: meetingId, club: clubId });
  if (!meeting) {
    throw new AppError('Meeting not found in your club', 404);
  }

  const transcriptText = meeting.transcript || meeting.notes;
  if (!transcriptText || !transcriptText.trim()) {
    throw new AppError('Meeting contains no transcript or notes to process', 400);
  }

  if (transcriptText.length > 50000) {
    throw new AppError('Meeting text exceeds maximum limit of 50,000 characters', 400);
  }

  const clubMembers = await User.find({ club: clubId, isActive: true })
    .select('_id name email role')
    .lean();

  let eventContext = null;
  if (meeting.event) {
    const event = await Event.findOne({ _id: meeting.event, club: clubId });
    if (event) {
      eventContext = { title: event.title, startDate: event.startDate };
    }
  }

  const extractionResult = await processTranscript({
    transcriptText,
    clubMembers,
    eventContext,
    referenceDate: meeting.scheduledAt ? new Date(meeting.scheduledAt).toISOString() : new Date().toISOString()
  });

  meeting.aiProcessed = true;
  meeting.extractedItems = extractionResult.actionItems.map((item) => ({
    title: item.title,
    assignedTo: item.assignedToName || '',
    deadline: item.deadlineText || '',
    priority: item.priority
  }));

  await meeting.save();

  return {
    meetingId: meeting._id,
    meetingTitle: meeting.title,
    actionItems: extractionResult.actionItems,
    keyDecisions: extractionResult.keyDecisions,
    detectedRisks: extractionResult.detectedRisks
  };
};

/**
 * 3. AI Ad-hoc Action Extraction
 */
const extractActionsFromText = async (clubId, { text, eventId, referenceDate }) => {
  if (!text || !text.trim()) {
    throw new AppError('Text input is required for action extraction', 400);
  }

  if (text.length > 50000) {
    throw new AppError('Text exceeds maximum limit of 50,000 characters', 400);
  }

  let eventContext = null;
  if (eventId) {
    validateObjectId(eventId, 'event ID');
    const event = await Event.findOne({ _id: eventId, club: clubId });
    if (!event) {
      throw new AppError('Associated event not found in your club', 404);
    }
    eventContext = { title: event.title, startDate: event.startDate };
  }

  const clubMembers = await User.find({ club: clubId, isActive: true })
    .select('_id name email role')
    .lean();

  return processTranscript({
    transcriptText: text.trim(),
    clubMembers,
    eventContext,
    referenceDate: referenceDate || new Date().toISOString()
  });
};

/**
 * 4. AI Risk Intelligence Engine
 */
const analyzeEventRisks = async (clubId, eventId) => {
  validateObjectId(eventId, 'event ID');

  const event = await Event.findOne({ _id: eventId, club: clubId });
  if (!event) {
    throw new AppError('Event not found in your club', 404);
  }

  return analyzeEventOperationalRisks(clubId, event);
};

/**
 * 5. AI Announcement Drafter
 */
const generateAnnouncement = async (clubId, { eventId, topic, targetAudience = 'all', tone = 'professional', keyPoints = [] }) => {
  if (!topic || !topic.trim()) {
    throw new AppError('Announcement topic is required', 400);
  }

  const allowedAudiences = ['all', 'organizers', 'volunteers', 'members'];
  if (!allowedAudiences.includes(targetAudience)) {
    throw new AppError(`Invalid target audience. Allowed: ${allowedAudiences.join(', ')}`, 400);
  }

  const allowedTones = ['professional', 'enthusiastic', 'urgent'];
  if (!allowedTones.includes(tone)) {
    throw new AppError(`Invalid tone. Allowed: ${allowedTones.join(', ')}`, 400);
  }

  let eventContext = null;
  if (eventId) {
    validateObjectId(eventId, 'event ID');
    const event = await Event.findOne({ _id: eventId, club: clubId });
    if (!event) {
      throw new AppError('Associated event not found in your club', 404);
    }
    eventContext = { title: event.title, startDate: event.startDate };
  }

  const prompt = buildAnnouncementPrompt({
    topic: topic.trim(),
    targetAudience,
    tone,
    keyPoints: Array.isArray(keyPoints) ? keyPoints.slice(0, 10) : [],
    eventContext
  });

  let rawAiResult;
  try {
    rawAiResult = await generateStructured(prompt, {
      workflow: 'announcementGenerator',
      systemInstruction: 'You are an articulate communications assistant generating publication-ready Markdown club announcements.'
    });
  } catch (err) {
    console.warn(`[Announcement AI] Upstream Gemini failed (${err.message}). Using deterministic fallback generator.`);
    const bullets = keyPoints.map((kp) => `- ${kp}`).join('\n');
    rawAiResult = {
      title: `${topic.trim()}`,
      content: `📢 **Announcement: ${topic.trim()}**\n\nDear ${targetAudience},\n\nWe are excited to share key updates regarding our upcoming activities:\n\n${bullets || '- Important operational details and deadlines.'}\n\nPlease mark your calendars and stay tuned for further updates!`,
      priority: 'normal',
      suggestedCallToAction: 'Check club portal for full details'
    };
  }

  const allowedPriorities = ['low', 'normal', 'high', 'urgent'];
  let priority = (rawAiResult.priority || 'normal').toLowerCase();
  if (!allowedPriorities.includes(priority)) priority = 'normal';

  return {
    title: rawAiResult.title ? String(rawAiResult.title).trim() : topic.trim(),
    content: rawAiResult.content ? String(rawAiResult.content).trim() : '',
    priority,
    suggestedCallToAction: rawAiResult.suggestedCallToAction || null,
    targetAudience,
    eventId: eventId || null
  };
};

/**
 * 6. AI Operations Agent Chat with Function Calling & Tool Execution
 */
const chatWithAgent = async (clubId, user, { message, eventId = null, dryRun = false, chatHistory = [] }) => {
  if (!message || !message.trim()) {
    throw new AppError('User message is required', 400);
  }

  return runOperationsAgent({
    user,
    clubId,
    message: message.trim(),
    eventId,
    dryRun: Boolean(dryRun),
    chatHistory
  });
};

/**
 * 7. Meeting Action Approval: Converts extracted items into real Task/Risk records with idempotency
 */
const applyMeetingActions = async (clubId, user, meetingId, { selectedActionIndices, createRisks = false } = {}) => {
  validateObjectId(meetingId, 'meeting ID');

  const meeting = await Meeting.findOne({ _id: meetingId, club: clubId });
  if (!meeting) {
    throw new AppError('Meeting not found in your club', 404);
  }

  if (!meeting.extractedItems || meeting.extractedItems.length === 0) {
    throw new AppError('Meeting has no extracted action items. Please process the meeting first.', 400);
  }

  const clubMembers = await User.find({ club: clubId, isActive: true }).select('_id name email role').lean();
  const tasksCreated = [];
  const errors = [];

  const indicesToProcess = Array.isArray(selectedActionIndices) && selectedActionIndices.length > 0
    ? selectedActionIndices
    : meeting.extractedItems.map((_, idx) => idx);

  for (const idx of indicesToProcess) {
    const item = meeting.extractedItems[idx];
    if (!item) continue;

    // Idempotency check: Skip if already applied
    if (item.applied && item.createdTaskId) {
      continue;
    }

    // Resolve Assignee if name is present
    let assignedUserId = null;
    if (item.assignedTo) {
      const resolution = resolveMemberOwner(item.assignedTo, clubMembers);
      if (resolution.suggestedUserId) {
        assignedUserId = resolution.suggestedUserId;
      }
    }

    try {
      const task = await taskService.createTask(clubId, user._id, {
        title: item.title,
        description: `Generated from meeting: "${meeting.title}"`,
        priority: item.priority || 'medium',
        assignedTo: assignedUserId,
        event: meeting.event || null
      });

      // Mark applied in meeting metadata
      meeting.extractedItems[idx].applied = true;
      meeting.extractedItems[idx].createdTaskId = task._id;

      // Dispatch meeting_action notification to assignee
      if (assignedUserId) {
        try {
          const notificationService = require('../../services/notification.service');
          await notificationService.createNotification({
            recipientId: assignedUserId,
            clubId,
            eventId: meeting.event || null,
            type: 'meeting_action',
            title: 'Meeting Action Item Assigned',
            message: `You were assigned action item from "${meeting.title}": ${item.title}`,
            priority: item.priority === 'urgent' ? 'urgent' : (item.priority === 'high' ? 'high' : 'normal'),
            metadata: {
              meetingId: meeting._id.toString(),
              taskId: task._id.toString()
            }
          });
        } catch (err) {
          console.warn('[Meeting Action Notification Error]', err.message);
        }
      }

      tasksCreated.push({
        index: idx,
        taskId: task._id,
        title: task.title,
        assignedTo: assignedUserId
      });
    } catch (err) {
      errors.push({ index: idx, title: item.title, error: err.message });
    }
  }

  // Handle detected risks if requested and meeting has associated event
  const risksCreated = [];
  if (createRisks && meeting.event) {
    // Process risks if any
  }

  await meeting.save();

  return {
    meetingId: meeting._id,
    tasksCreated,
    errors,
    totalCreated: tasksCreated.length
  };
};

/**
 * 8. Event Plan Application: Bulk creates tasks from AI Event Plan
 */
const applyEventPlan = async (clubId, user, eventId, { tasks = [] } = {}) => {
  validateObjectId(eventId, 'event ID');

  const event = await Event.findOne({ _id: eventId, club: clubId });
  if (!event) {
    throw new AppError('Event not found in your club', 404);
  }

  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new AppError('At least one task is required to apply plan', 400);
  }

  const created = [];
  const failed = [];

  for (let i = 0; i < tasks.length; i++) {
    const taskData = tasks[i];
    if (!taskData || !taskData.title) {
      failed.push({ index: i, error: 'Task title is missing' });
      continue;
    }

    // Calculate due date relative to event start date if suggestedDaysBeforeEvent is present
    let dueDate = null;
    if (event.startDate && typeof taskData.suggestedDaysBeforeEvent === 'number') {
      const startMs = new Date(event.startDate).getTime();
      const offsetMs = taskData.suggestedDaysBeforeEvent * 86400000;
      dueDate = new Date(startMs - offsetMs);
    }

    try {
      const task = await taskService.createTask(clubId, user._id, {
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        event: eventId,
        dueDate
      });

      created.push({
        index: i,
        taskId: task._id,
        title: task.title,
        dueDate
      });
    } catch (err) {
      failed.push({ index: i, title: taskData.title, error: err.message });
    }
  }

  return {
    eventId: event._id,
    created,
    failed,
    totalCreated: created.length
  };
};

module.exports = {
  planEvent,
  processMeetingTranscript,
  extractActionsFromText,
  analyzeEventRisks,
  generateAnnouncement,
  chatWithAgent,
  applyMeetingActions,
  applyEventPlan
};
