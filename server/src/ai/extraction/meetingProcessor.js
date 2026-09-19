const { generateStructured } = require('../gemini/client');
const { buildMeetingExtractorPrompt } = require('../prompts/meetingExtractor.prompt');

/**
 * Resolves an extracted person's name against a list of club members.
 * Implements strict ambiguity protection: if multiple members share the same name, returns null.
 */
const resolveMemberOwner = (rawName, clubMembers = []) => {
  if (!rawName || typeof rawName !== 'string' || !rawName.trim()) {
    return { suggestedUserId: null, matchedName: null, matchType: 'none', confidence: 0 };
  }

  const cleanName = rawName.trim().toLowerCase();

  // 1. Exact full name match (case-insensitive)
  const exactMatches = clubMembers.filter((m) => m.name && m.name.trim().toLowerCase() === cleanName);
  if (exactMatches.length === 1) {
    return {
      suggestedUserId: exactMatches[0]._id,
      matchedName: exactMatches[0].name,
      matchType: 'exact',
      confidence: 0.95
    };
  }

  // 2. Exact email match if rawName resembles an email
  if (cleanName.includes('@')) {
    const emailMatches = clubMembers.filter((m) => m.email && m.email.trim().toLowerCase() === cleanName);
    if (emailMatches.length === 1) {
      return {
        suggestedUserId: emailMatches[0]._id,
        matchedName: emailMatches[0].name,
        matchType: 'email',
        confidence: 0.99
      };
    }
  }

  // 3. First name match
  const firstName = cleanName.split(' ')[0];
  const firstNameMatches = clubMembers.filter((m) => {
    if (!m.name) return false;
    const memberFirst = m.name.trim().toLowerCase().split(' ')[0];
    return memberFirst === firstName;
  });

  if (firstNameMatches.length === 1) {
    return {
      suggestedUserId: firstNameMatches[0]._id,
      matchedName: firstNameMatches[0].name,
      matchType: 'first_name',
      confidence: 0.85
    };
  } else if (firstNameMatches.length > 1) {
    // Ambiguous match (e.g. multiple "Rahul"s) - do NOT guess
    return {
      suggestedUserId: null,
      matchedName: null,
      matchType: 'ambiguous',
      possibleMatches: firstNameMatches.map((m) => ({ id: m._id, name: m.name })),
      confidence: 0
    };
  }

  // 4. Safe substring match
  const substringMatches = clubMembers.filter((m) => m.name && m.name.toLowerCase().includes(cleanName));
  if (substringMatches.length === 1) {
    return {
      suggestedUserId: substringMatches[0]._id,
      matchedName: substringMatches[0].name,
      matchType: 'partial',
      confidence: 0.75
    };
  }

  return {
    suggestedUserId: null,
    matchedName: null,
    matchType: 'unmatched',
    confidence: 0
  };
};

/**
 * Normalizes and validates raw Gemini extraction output.
 */
const normalizeExtractionResult = (aiRawOutput, clubMembers = []) => {
  const allowedPriorities = ['low', 'medium', 'high', 'urgent'];
  const allowedSeverities = ['low', 'medium', 'high', 'critical'];
  const allowedProbabilities = ['low', 'medium', 'high'];

  // Normalize Action Items
  const actionItems = Array.isArray(aiRawOutput.actionItems)
    ? aiRawOutput.actionItems.map((item) => {
        const ownerResolution = resolveMemberOwner(item.assignedToName, clubMembers);

        let priority = (item.priority || 'medium').toLowerCase();
        if (!allowedPriorities.includes(priority)) {
          priority = 'medium';
        }

        return {
          title: item.title ? String(item.title).trim() : 'Untitled Action Item',
          description: item.description ? String(item.description).trim() : '',
          assignedToName: item.assignedToName || null,
          suggestedUserId: ownerResolution.suggestedUserId,
          ownerResolution: {
            matchType: ownerResolution.matchType,
            matchedName: ownerResolution.matchedName,
            confidence: ownerResolution.confidence,
            possibleMatches: ownerResolution.possibleMatches || []
          },
          deadlineText: item.deadlineText || null,
          estimatedIsoDate: item.estimatedIsoDate || null,
          priority,
          confidence: typeof item.confidence === 'number' ? item.confidence : 0.8
        };
      })
    : [];

  // Normalize Key Decisions
  const keyDecisions = Array.isArray(aiRawOutput.keyDecisions)
    ? aiRawOutput.keyDecisions.map((d) => String(d).trim()).filter(Boolean)
    : [];

  // Normalize Detected Risks
  const detectedRisks = Array.isArray(aiRawOutput.detectedRisks)
    ? aiRawOutput.detectedRisks.map((risk) => {
        let severity = (risk.severity || 'medium').toLowerCase();
        if (!allowedSeverities.includes(severity)) severity = 'medium';

        let probability = (risk.probability || 'medium').toLowerCase();
        if (!allowedProbabilities.includes(probability)) probability = 'medium';

        return {
          title: risk.title ? String(risk.title).trim() : 'Identified Meeting Risk',
          description: risk.description ? String(risk.description).trim() : '',
          severity,
          probability
        };
      })
    : [];

  return {
    actionItems,
    keyDecisions,
    detectedRisks
  };
};

/**
 * Orchestrates transcript extraction using Gemini and owner resolution.
 */
const processTranscript = async ({ transcriptText, clubMembers = [], eventContext = null, referenceDate }) => {
  const prompt = buildMeetingExtractorPrompt({
    transcriptText,
    memberRoster: clubMembers.map((m) => ({ id: m._id, name: m.name, role: m.role })),
    eventContext,
    referenceDate
  });

  const rawAiResult = await generateStructured(prompt, {
    workflow: 'meetingProcessor',
    systemInstruction: 'You are an accurate, deterministic meeting analyst that outputs pure JSON matching the requested schema without conversational filler.'
  });

  return normalizeExtractionResult(rawAiResult, clubMembers);
};

module.exports = {
  resolveMemberOwner,
  normalizeExtractionResult,
  processTranscript
};
