const { toolDeclarations } = require('./toolDeclarations');
const { toolExecutors } = require('./toolExecutors');

const TOOL_REGISTRY = {
  create_task: {
    declaration: toolDeclarations.find((t) => t.name === 'create_task'),
    executor: toolExecutors.create_task,
    mutatesData: true,
    requiresConfirmation: true
  },
  update_task_status: {
    declaration: toolDeclarations.find((t) => t.name === 'update_task_status'),
    executor: toolExecutors.update_task_status,
    mutatesData: true,
    requiresConfirmation: false
  },
  assign_task: {
    declaration: toolDeclarations.find((t) => t.name === 'assign_task'),
    executor: toolExecutors.assign_task,
    mutatesData: true,
    requiresConfirmation: false
  },
  create_risk: {
    declaration: toolDeclarations.find((t) => t.name === 'create_risk'),
    executor: toolExecutors.create_risk,
    mutatesData: true,
    requiresConfirmation: true
  },
  create_announcement: {
    declaration: toolDeclarations.find((t) => t.name === 'create_announcement'),
    executor: toolExecutors.create_announcement,
    mutatesData: true,
    requiresConfirmation: true
  },
  get_event_status: {
    declaration: toolDeclarations.find((t) => t.name === 'get_event_status'),
    executor: toolExecutors.get_event_status,
    mutatesData: false,
    requiresConfirmation: false
  },
  list_unassigned_tasks: {
    declaration: toolDeclarations.find((t) => t.name === 'list_unassigned_tasks'),
    executor: toolExecutors.list_unassigned_tasks,
    mutatesData: false,
    requiresConfirmation: false
  },
  list_available_volunteers: {
    declaration: toolDeclarations.find((t) => t.name === 'list_available_volunteers'),
    executor: toolExecutors.list_available_volunteers,
    mutatesData: false,
    requiresConfirmation: false
  },
  search_club_knowledge: {
    declaration: toolDeclarations.find((t) => t.name === 'search_club_knowledge'),
    executor: toolExecutors.search_club_knowledge,
    mutatesData: false,
    requiresConfirmation: false
  },
  send_broadcast_alert: {
    declaration: toolDeclarations.find((t) => t.name === 'send_broadcast_alert'),
    executor: toolExecutors.send_broadcast_alert,
    mutatesData: true,
    requiresConfirmation: true
  },
  broadcast_announcement: {
    declaration: toolDeclarations.find((t) => t.name === 'send_broadcast_alert'),
    executor: toolExecutors.broadcast_announcement,
    mutatesData: true,
    requiresConfirmation: true
  },
  list_events: {
    declaration: toolDeclarations.find((t) => t.name === 'list_events'),
    executor: toolExecutors.list_events,
    mutatesData: false,
    requiresConfirmation: false
  },
  list_tasks: {
    declaration: toolDeclarations.find((t) => t.name === 'list_tasks'),
    executor: toolExecutors.list_tasks,
    mutatesData: false,
    requiresConfirmation: false
  },
  list_risks: {
    declaration: toolDeclarations.find((t) => t.name === 'list_risks'),
    executor: toolExecutors.list_risks,
    mutatesData: false,
    requiresConfirmation: false
  },
  list_meetings: {
    declaration: toolDeclarations.find((t) => t.name === 'list_meetings'),
    executor: toolExecutors.list_meetings,
    mutatesData: false,
    requiresConfirmation: false
  },
  list_volunteers: {
    declaration: toolDeclarations.find((t) => t.name === 'list_volunteers'),
    executor: toolExecutors.list_volunteers,
    mutatesData: false,
    requiresConfirmation: false
  }
};

/**
 * Returns function declarations array formatted for Gemini function calling.
 */
const getGeminiTools = () => {
  return [
    {
      functionDeclarations: toolDeclarations
    }
  ];
};

/**
 * Executes a registered tool securely with context.
 */
const executeTool = async (toolName, args, context) => {
  const toolEntry = TOOL_REGISTRY[toolName];
  if (!toolEntry || typeof toolEntry.executor !== 'function') {
    return {
      tool: toolName,
      success: false,
      error: { code: 'UNKNOWN_TOOL', message: `Tool "${toolName}" is not registered in the system.` }
    };
  }

  return toolEntry.executor(args, context);
};

module.exports = {
  TOOL_REGISTRY,
  getGeminiTools,
  executeTool
};
