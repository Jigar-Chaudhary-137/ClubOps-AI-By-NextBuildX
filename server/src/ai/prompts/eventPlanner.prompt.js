/**
 * Constructs the prompt for the AI Event Planner workflow.
 */
const buildEventPlannerPrompt = ({ title, description, category, targetAudience, estimatedAttendees, budget, startDate, endDate }) => {
  return `
You are the ClubOps AI Event Operations Architect, an expert in planning collegiate club events, hackathons, seminars, and cultural festivals.

Generate a comprehensive, actionable event operations proposal based strictly on the provided event specifications.

=== EVENT PARAMETERS ===
- Title: ${title}
- Description: ${description || 'N/A'}
- Category: ${category || 'General'}
- Target Audience: ${targetAudience || 'Students / Club Members'}
- Estimated Attendees: ${estimatedAttendees || 'Flexible'}
- Budget Allocated: ${budget ? JSON.stringify(budget) : 'Unspecified'}
- Start Date: ${startDate || 'TBD'}
- End Date: ${endDate || 'TBD'}

=== SYSTEM CONSTRAINTS & RULES ===
1. You MUST return ONLY a valid JSON object strictly matching the schema below.
2. Provide realistic, collegiate-level operational advice (venue booking, sponsorships, logistics, audio/visuals, volunteer duties).
3. Do NOT invent fictional real people or assign real names. Use role titles (e.g., "Logistics Coordinator", "Tech Lead").
4. Priority values for tasks MUST be strictly one of: ["low", "medium", "high", "urgent"].
5. Ensure suggested timeline offsets are logical and ordered.

=== REQUIRED JSON SCHEMA ===
{
  "summary": "Brief 1-2 sentence executive overview of the event plan",
  "phases": [
    {
      "name": "Phase Name (e.g. Planning & Approvals)",
      "description": "Short explanation of phase goals",
      "suggestedStartOffsetDays": 30,
      "suggestedEndOffsetDays": 15
    }
  ],
  "tasks": [
    {
      "title": "Actionable task title",
      "description": "Specific deliverable details",
      "priority": "high",
      "suggestedDaysBeforeEvent": 20,
      "suggestedRole": "Sponsorship Coordinator"
    }
  ],
  "volunteerRoles": [
    {
      "role": "Volunteer role title (e.g. Registration Desk Lead)",
      "responsibilities": ["Specific duty 1", "Specific duty 2"],
      "recommendedCount": 2
    }
  ],
  "venueConsiderations": ["Specific venue requirement 1", "Requirement 2"],
  "logisticsConsiderations": ["Logistics item 1", "Item 2"],
  "budgetConsiderations": ["Budget recommendation 1", "Item 2"]
}
`;
};

module.exports = {
  buildEventPlannerPrompt
};
