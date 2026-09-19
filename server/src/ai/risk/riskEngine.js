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

  let rawAiResult;
  try {
    rawAiResult = await generateStructured(prompt, {
      workflow: 'riskEngine',
      systemInstruction: 'You are an objective, conservative risk analysis agent that identifies real operational bottlenecks based solely on provided facts.'
    });
  } catch (err) {
    console.warn(`[Risk AI] Upstream Gemini failed (${err.message}). Analyzing deterministic operational facts.`);
    const fallbackRisks = [];

    if (opData.metrics.overdueTasks > 0) {
      fallbackRisks.push({
        title: 'Overdue Operational Tasks',
        description: `${opData.metrics.overdueTasks} task(s) are past their designated deadline and remain incomplete.`,
        severity: 'high',
        probability: 'high',
        mitigationPlan: 'Reassign overdue tasks or allocate additional volunteer support immediately.',
        reasoning: 'Critical event milestones depend on timely task completion.'
      });
    }

    if (opData.metrics.unassignedUrgentTasks > 0) {
      fallbackRisks.push({
        title: 'Unassigned High-Priority Tasks',
        description: `${opData.metrics.unassignedUrgentTasks} urgent/high-priority task(s) have no designated owner.`,
        severity: 'high',
        probability: 'medium',
        mitigationPlan: 'Review volunteer roster and assign department leads to unassigned tasks.',
        reasoning: 'Unassigned urgent tasks cause last-minute operational failures.'
      });
    }

    if (opData.volunteerSummary.availableVolunteers === 0 && opData.metrics.pendingTasks > 0) {
      fallbackRisks.push({
        title: 'Volunteer Capacity Constraint',
        description: 'Zero volunteers are currently marked as available to take on pending tasks.',
        severity: 'medium',
        probability: 'medium',
        mitigationPlan: 'Broadcast volunteer recruitment announcement to club members.',
        reasoning: 'Active task backlog exceeds available volunteer capacity.'
      });
    }

    // Include existing risks if none detected dynamically
    if (fallbackRisks.length === 0 && opData.existingRisks.length > 0) {
      for (const er of opData.existingRisks) {
        fallbackRisks.push({
          title: er.title,
          description: er.description || 'Existing identified operational risk',
          severity: er.severity || 'medium',
          probability: 'medium',
          mitigationPlan: 'Review ongoing mitigation measures with event lead.',
          reasoning: 'Tracked in active risk log.'
        });
      }
    }

    rawAiResult = {
      summary: `Automated assessment of ${opData.metrics.totalTasks} tasks and ${opData.volunteerSummary.totalVolunteers} volunteers.`,
      overallRiskLevel: fallbackRisks.some((r) => r.severity === 'high') ? 'high' : 'medium',
      risks: fallbackRisks
    };
  }

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
