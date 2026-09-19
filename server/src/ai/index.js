const aiService = require('./services/ai.service');
const aiController = require('./controllers/ai.controller');
const aiRoutes = require('./routes/ai.routes');
const { generateStructured } = require('./gemini/client');
const { processTranscript } = require('./extraction/meetingProcessor');
const { analyzeEventOperationalRisks } = require('./risk/riskEngine');

module.exports = {
  aiService,
  aiController,
  aiRoutes,
  generateStructured,
  processTranscript,
  analyzeEventOperationalRisks
};
