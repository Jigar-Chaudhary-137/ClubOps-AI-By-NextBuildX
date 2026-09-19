const express = require('express');
const aiController = require('../controllers/ai.controller');
const knowledgeController = require('../controllers/knowledge.controller');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/authorize');

const router = express.Router();

// Apply authentication and role authorization (Admin / Organizer) to all AI routes
router.use(authenticate);
router.use(authorize('admin', 'organizer'));

// AI Event Planner
router.post('/plan-event', aiController.planEvent);

// AI Meeting Transcript Processor
router.post('/process-meeting/:id', aiController.processMeeting);

// AI Ad-hoc Action Item Extraction from Text
router.post('/extract-actions', aiController.extractActions);

// AI Operational Risk Intelligence Engine
router.post('/analyze-risks/:eventId', aiController.analyzeRisks);

// AI Announcement Drafter
router.post('/generate-announcement', aiController.generateAnnouncement);

// --- STAGE 5: Autonomous Operations Agent & Approval Workflows ---

// AI Operations Agent with Multi-Turn Tool Calling
router.post('/agent/chat', aiController.chatWithAgent);

// Meeting Action Items Approval & Task Creation
router.post('/meetings/:id/apply-actions', aiController.applyMeetingActions);

// Event Plan Approval & Bulk Task Creation
router.post('/events/:id/apply-plan', aiController.applyEventPlan);

// --- STAGE 6: Multi-Tenant RAG Knowledge Base ---

// Grounded RAG Query with Citations
router.post('/knowledge/query', knowledgeController.queryKnowledgeBase);

// Pure Semantic Search / Chunk Retrieval
router.post('/knowledge/search', knowledgeController.searchKnowledgeBase);

module.exports = router;
