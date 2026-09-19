/**
 * Constructs the prompt for the AI Event Risk Intelligence Engine.
 */
const buildRiskAnalysisPrompt = ({ event, metrics, tasksSummary, volunteerSummary, existingRisks = [] }) => {
  return `
You are the ClubOps AI Event Risk & Intelligence Specialist.

Analyze the operational metrics and status of the college club event below to detect potential operational bottlenecks, timeline hazards, volunteer shortfalls, and execution risks.

=== EVENT INFORMATION ===
- Title: "${event.title}"
- Status: ${event.status}
- Start Date: ${event.startDate || 'TBD'}
- End Date: ${event.endDate || 'TBD'}
- Category: ${event.category}
- Budget: Allocated ${event.budget?.allocated || 0} ${event.budget?.currency || 'INR'}, Spent ${event.budget?.spent || 0}

=== OPERATIONAL METRICS (FACTUAL DATABASE SUMMARY) ===
- Total Tasks: ${metrics.totalTasks}
- Completed Tasks: ${metrics.completedTasks}
- Pending/In-Progress Tasks: ${metrics.pendingTasks}
- Overdue Tasks: ${metrics.overdueTasks || 0}
- Unassigned Urgent/High Tasks: ${metrics.unassignedUrgentTasks || 0}
- Total Registered Volunteers: ${volunteerSummary.totalVolunteers}
- Available Volunteers: ${volunteerSummary.availableVolunteers}
- Assigned Volunteers: ${volunteerSummary.assignedVolunteers}
- Busy/Unavailable Volunteers: ${volunteerSummary.busyVolunteers}
- Existing Documented Risks: ${existingRisks.length}

=== SAMPLES OF CRITICAL/PENDING TASKS ===
${JSON.stringify(tasksSummary, null, 2)}

=== INSTRUCTIONS & RULES ===
1. Distinguish FACTUAL data from AI RISK INTERPRETATION. Do not hallucinate metrics.
2. Identify distinct, plausible operational risks arising from bottlenecks (e.g. unassigned urgent tasks, volunteer shortages, pending budget approvals close to start date).
3. Allowed severity: ["low", "medium", "high", "critical"].
4. Allowed probability: ["low", "medium", "high"].
5. Provide a clear, practical mitigation plan for each risk.

=== REQUIRED JSON OUTPUT SCHEMA ===
{
  "summary": "Short 1-2 sentence assessment of the event's overall operational health",
  "overallRiskLevel": "medium",
  "risks": [
    {
      "title": "Concise risk title",
      "description": "Specific context of the vulnerability",
      "severity": "high",
      "probability": "medium",
      "mitigationPlan": "Immediate actionable steps to resolve or mitigate",
      "reasoning": "Why this is a risk based on the operational data"
    }
  ]
}
`;
};

module.exports = {
  buildRiskAnalysisPrompt
};
