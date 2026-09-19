const Task = require('../../models/Task');
const Volunteer = require('../../models/Volunteer');
const Risk = require('../../models/Risk');
const { generateStructured } = require('../gemini/client');
const { buildRiskAnalysisPrompt } = require('../prompts/riskAnalysis.prompt');

/**
 * Gathers deterministic operational facts from MongoDB for a given event.
 */
const collectEventOperationalData = async (clubId, event) => {
  const now = new Date();

  const [tasks, volunteers, existingRisks] = await Promise.all([
    Task.find({ event: event._id, club: clubId })
      .select('title status priority dueDate assignedTo volunteer')
      .populate('assignedTo', 'name')
      .lean(),
    Volunteer.find({ event: event._id, club: clubId })
      .select('department availability skills')
      .lean(),
    Risk.find({ event: event._id, club: clubId })
      .select('title severity status')
      .lean()
  ]);

  // Compute deterministic metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'completed').length;

  const overdueTasks = tasks.filter((t) => {
    return t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now;
  }).length;

  const unassignedUrgentTasks = tasks.filter((t) => {
    return t.status !== 'completed' && !t.assignedTo && ['high', 'urgent'].includes(t.priority);
  }).length;

  // Volunteer metrics
  const totalVolunteers = volunteers.length;
  const availableVolunteers = volunteers.filter((v) => v.availability === 'available').length;
  const assignedVolunteers = volunteers.filter((v) => v.availability === 'assigned').length;
  const busyVolunteers = volunteers.filter((v) => ['busy', 'unavailable'].includes(v.availability)).length;

  const metrics = {
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    unassignedUrgentTasks
  };

  const volunteerSummary = {
    totalVolunteers,
    availableVolunteers,
    assignedVolunteers,
    busyVolunteers
  };

  const tasksSummary = tasks.slice(0, 15).map((t) => ({
    title: t.title,
    status: t.status,
    priority: t.priority,
    isOverdue: t.dueDate ? new Date(t.dueDate) < now : false,
    assignedTo: t.assignedTo ? t.assignedTo.name : 'UNASSIGNED'
  }));

  return {
    metrics,
    volunteerSummary,
    tasksSummary,
    existingRisks
  };
};

/**
 * Executes AI risk analysis based on real operational data.
 */
const analyzeEventOperationalRisks = async (clubId, event) => {
  const opData = await collectEventOperationalData(clubId, event);

  const prompt = buildRiskAnalysisPrompt({
    event,
    metrics: opData.metrics,
    tasksSummary: opData.tasksSummary,
    volunteerSummary: opData.volunteerSummary,
    existingRisks: opData.existingRisks
  });

  const rawAiResult = await generateStructured(prompt, {
    workflow: 'riskEngine',
    systemInstruction: 'You are an objective, conservative risk analysis agent that identifies real operational bottlenecks based solely on provided facts.'
  });

  const allowedSeverities = ['low', 'medium', 'high', 'critical'];
  const allowedProbabilities = ['low', 'medium', 'high'];

  const normalizedRisks = Array.isArray(rawAiResult.risks)
    ? rawAiResult.risks.map((r) => {
        let severity = (r.severity || 'medium').toLowerCase();
        if (!allowedSeverities.includes(severity)) severity = 'medium';

        let probability = (r.probability || 'medium').toLowerCase();
        if (!allowedProbabilities.includes(probability)) probability = 'medium';

        return {
          title: r.title ? String(r.title).trim() : 'Operational Risk',
          description: r.description ? String(r.description).trim() : '',
          severity,
          probability,
          mitigationPlan: r.mitigationPlan ? String(r.mitigationPlan).trim() : 'Review operational timeline with organizers.',
          reasoning: r.reasoning ? String(r.reasoning).trim() : ''
        };
      })
    : [];

  return {
    summary: rawAiResult.summary || 'Event operational assessment completed.',
    overallRiskLevel: rawAiResult.overallRiskLevel || 'medium',
    risks: normalizedRisks,
    analysisMetadata: {
      generatedAt: new Date().toISOString(),
      tasksAnalyzed: opData.metrics.totalTasks,
      volunteersAnalyzed: opData.volunteerSummary.totalVolunteers,
      metricsSnapshot: opData.metrics
    }
  };
};

module.exports = {
  collectEventOperationalData,
  analyzeEventOperationalRisks
};
