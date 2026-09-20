/**
 * Tool / Function Declarations for Google Gemini Function Calling
 * Formatted according to the @google/generative-ai SDK schema.
 */

const toolDeclarations = [
  // 1. Create Task (Mutation)
  {
    name: 'create_task',
    description: 'Create a new task under an event for the authenticated user\'s club.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: {
          type: 'STRING',
          description: 'Descriptive title of the task to create.'
        },
        eventId: {
          type: 'STRING',
          description: 'The MongoDB ObjectId of the associated event.'
        },
        description: {
          type: 'STRING',
          description: 'Detailed instructions or deliverables for the task.'
        },
        assignedToName: {
          type: 'STRING',
          description: 'The name or first name of the club member to assign this task to.'
        },
        userId: {
          type: 'STRING',
          description: 'Optional explicit MongoDB ObjectId of the assigned user.'
        },
        priority: {
          type: 'STRING',
          enum: ['low', 'medium', 'high', 'urgent'],
          description: 'Priority level of the task.'
        },
        dueDate: {
          type: 'STRING',
          description: 'Due date in ISO-8601 format (e.g. YYYY-MM-DD).'
        }
      },
      required: ['title']
    }
  },

  // 2. Update Task Status (Mutation)
  {
    name: 'update_task_status',
    description: 'Update the progress status of an existing task.',
    parameters: {
      type: 'OBJECT',
      properties: {
        taskId: {
          type: 'STRING',
          description: 'The MongoDB ObjectId of the task to update.'
        },
        status: {
          type: 'STRING',
          enum: ['todo', 'in_progress', 'review', 'completed', 'cancelled'],
          description: 'The new status to apply.'
        }
      },
      required: ['taskId', 'status']
    }
  },

  // 3. Assign Task (Mutation)
  {
    name: 'assign_task',
    description: 'Assign or reassign an existing task to a specific club member.',
    parameters: {
      type: 'OBJECT',
      properties: {
        taskId: {
          type: 'STRING',
          description: 'The MongoDB ObjectId of the task.'
        },
        assigneeName: {
          type: 'STRING',
          description: 'The name of the club member to assign the task to.'
        },
        userId: {
          type: 'STRING',
          description: 'Optional explicit MongoDB ObjectId of the assignee.'
        }
      },
      required: ['taskId']
    }
  },

  // 4. Create Risk (Mutation)
  {
    name: 'create_risk',
    description: 'Record an operational hazard, bottleneck, or risk into the event risk register.',
    parameters: {
      type: 'OBJECT',
      properties: {
        eventId: {
          type: 'STRING',
          description: 'The MongoDB ObjectId of the associated event.'
        },
        title: {
          type: 'STRING',
          description: 'Concise title of the risk.'
        },
        description: {
          type: 'STRING',
          description: 'Detailed explanation of why this risk exists.'
        },
        severity: {
          type: 'STRING',
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'Risk severity rating.'
        },
        probability: {
          type: 'STRING',
          enum: ['low', 'medium', 'high'],
          description: 'Likelihood of the risk occurring.'
        },
        mitigationPlan: {
          type: 'STRING',
          description: 'Actionable steps to resolve or mitigate the risk.'
        }
      },
      required: ['eventId', 'title', 'severity', 'mitigationPlan']
    }
  },

  // 5. Create Announcement (Mutation)
  {
    name: 'create_announcement',
    description: 'Draft or publish a broadcast announcement for the club or event.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: {
          type: 'STRING',
          description: 'Subject or title of the announcement.'
        },
        content: {
          type: 'STRING',
          description: 'Markdown-formatted announcement body.'
        },
        targetAudience: {
          type: 'STRING',
          enum: ['all', 'organizers', 'volunteers', 'members'],
          description: 'Target audience group.'
        },
        priority: {
          type: 'STRING',
          enum: ['low', 'normal', 'high', 'urgent'],
          description: 'Announcement priority level.'
        },
        eventId: {
          type: 'STRING',
          description: 'Optional MongoDB ObjectId of the associated event.'
        }
      },
      required: ['title', 'content']
    }
  },

  // 6. Get Event Status (Read-Only)
  {
    name: 'get_event_status',
    description: 'Query real-time operational status, task counts, volunteer status, and risks for an event.',
    parameters: {
      type: 'OBJECT',
      properties: {
        eventId: {
          type: 'STRING',
          description: 'The MongoDB ObjectId of the event to query.'
        }
      },
      required: ['eventId']
    }
  },

  // 7. List Unassigned Tasks (Read-Only)
  {
    name: 'list_unassigned_tasks',
    description: 'Find all tasks for an event that currently have no assignee assigned.',
    parameters: {
      type: 'OBJECT',
      properties: {
        eventId: {
          type: 'STRING',
          description: 'The MongoDB ObjectId of the event.'
        }
      },
      required: ['eventId']
    }
  },

  // 8. List Available Volunteers (Read-Only)
  {
    name: 'list_available_volunteers',
    description: 'List active club volunteers who are currently marked as available.',
    parameters: {
      type: 'OBJECT',
      properties: {
        department: {
          type: 'STRING',
          description: 'Optional department filter (e.g. Logistics, Technical, Design).'
        }
      }
    }
  },

  // 9. Search Club Knowledge Base (Read-Only RAG Tool)
  {
    name: 'search_club_knowledge',
    description: 'Search the authenticated club\'s indexed documents, policies, budgets, and guidelines to retrieve verified reference passages.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
          description: 'Question or topic to search for in the club knowledge base.'
        },
        eventId: {
          type: 'STRING',
          description: 'Optional MongoDB ObjectId of the associated event to narrow search.'
        }
      },
      required: ['query']
    }
  },

  // 10. Send Broadcast Alert (Mutation Tool)
  {
    name: 'send_broadcast_alert',
    description: 'Dispatch an urgent broadcast alert across live notification channels to volunteers, organizers, or club members.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: {
          type: 'STRING',
          description: 'Subject or header of the alert.'
        },
        message: {
          type: 'STRING',
          description: 'Content of the alert message.'
        },
        priority: {
          type: 'STRING',
          enum: ['normal', 'high', 'urgent'],
          description: 'Alert urgency level.'
        },
        audience: {
          type: 'STRING',
          enum: ['all', 'organizers', 'volunteers', 'members'],
          description: 'Target audience group.'
        },
        eventId: {
          type: 'STRING',
          description: 'Optional MongoDB ObjectId of the associated event.'
        },
        channels: {
          type: 'ARRAY',
          items: {
            type: 'STRING',
            enum: ['in_app', 'email', 'whatsapp']
          },
          description: 'Delivery channels (e.g. in_app, email, whatsapp).'
        }
      },
      required: ['title', 'message']
    }
  },

  // 11. List Events (Read-Only Workspace Tool)
  {
    name: 'list_events',
    description: 'List upcoming, active, or past events for the authenticated club workspace.',
    parameters: {
      type: 'OBJECT',
      properties: {
        status: {
          type: 'STRING',
          enum: ['draft', 'planning', 'ready', 'active', 'completed', 'cancelled', 'all'],
          description: 'Filter events by status (or "all").'
        },
        upcomingOnly: {
          type: 'BOOLEAN',
          description: 'If true, filters to events with startDate >= today or active/planning.'
        },
        limit: {
          type: 'INTEGER',
          description: 'Maximum number of events to return (default 10).'
        }
      }
    }
  },

  // 12. List Tasks (Read-Only Workspace Tool)
  {
    name: 'list_tasks',
    description: 'Query operational tasks across the club workspace with status, priority, due dates, and assignees.',
    parameters: {
      type: 'OBJECT',
      properties: {
        status: {
          type: 'STRING',
          enum: ['todo', 'in_progress', 'review', 'completed', 'cancelled', 'pending'],
          description: 'Filter tasks by status. "pending" returns incomplete tasks (todo, in_progress, review).'
        },
        priority: {
          type: 'STRING',
          enum: ['low', 'medium', 'high', 'urgent'],
          description: 'Filter tasks by priority level.'
        },
        eventId: {
          type: 'STRING',
          description: 'Optional MongoDB ObjectId of the associated event.'
        },
        upcomingDeadlinesOnly: {
          type: 'BOOLEAN',
          description: 'If true, sorts by earliest upcoming due dates and excludes completed.'
        },
        limit: {
          type: 'INTEGER',
          description: 'Maximum number of tasks to return (default 15).'
        }
      }
    }
  },

  // 13. List Risks (Read-Only Workspace Tool)
  {
    name: 'list_risks',
    description: 'Query operational hazards, bottlenecks, and risks recorded across club events.',
    parameters: {
      type: 'OBJECT',
      properties: {
        eventId: {
          type: 'STRING',
          description: 'Optional MongoDB ObjectId of the associated event.'
        },
        severity: {
          type: 'STRING',
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'Filter risks by severity rating.'
        },
        status: {
          type: 'STRING',
          enum: ['identified', 'mitigated', 'accepted', 'resolved'],
          description: 'Filter risks by operational status.'
        },
        limit: {
          type: 'INTEGER',
          description: 'Maximum number of risks to return (default 10).'
        }
      }
    }
  },

  // 14. List Meetings (Read-Only Workspace Tool)
  {
    name: 'list_meetings',
    description: 'Query club meetings, agendas, minutes, decisions, and extracted action items.',
    parameters: {
      type: 'OBJECT',
      properties: {
        eventId: {
          type: 'STRING',
          description: 'Optional MongoDB ObjectId of the associated event.'
        },
        limit: {
          type: 'INTEGER',
          description: 'Maximum number of meetings to return (default 5).'
        }
      }
    }
  },

  // 15. List Volunteers (Read-Only Workspace Tool)
  {
    name: 'list_volunteers',
    description: 'Query club volunteers, their assigned department, availability, skills, and current task workload.',
    parameters: {
      type: 'OBJECT',
      properties: {
        department: {
          type: 'STRING',
          description: 'Filter volunteers by department (e.g. Logistics, Technical, Design).'
        },
        availability: {
          type: 'STRING',
          enum: ['available', 'assigned', 'busy', 'unavailable'],
          description: 'Filter volunteers by availability status.'
        },
        sortByWorkload: {
          type: 'BOOLEAN',
          description: 'If true, sorts volunteers by highest assigned task workload first.'
        },
        limit: {
          type: 'INTEGER',
          description: 'Maximum number of volunteers to return (default 15).'
        }
      }
    }
  }
];

module.exports = {
  toolDeclarations
};
