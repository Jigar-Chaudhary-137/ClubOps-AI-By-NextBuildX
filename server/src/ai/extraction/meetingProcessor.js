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
 * Deterministic fallback extractor for when upstream LLM is unreachable.
 */
const deterministicFallbackExtraction = (transcriptText, clubMembers) => {
  const sentences = transcriptText
    .split(/(?<=[.!?\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  const actionKeywords = ['please', 'coordinate', 'prepare', 'finalize', 'submit', 'order', 'contact', 'schedule', 'arrange', 'test', 'setup', 'follow up'];
  const actionItems = [];

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    const hasAction = actionKeywords.some((kw) => lower.includes(kw));

    if (hasAction) {
      let assignedMember = null;
      for (const m of clubMembers) {
        if (!m.name) continue;
        const fullName = m.name.toLowerCase();
        const firstName = fullName.split(' ')[0];
        if (lower.includes(fullName)) {
          assignedMember = m.name;
          break;
        } else if (lower.includes(firstName)) {
          const sharedFirst = clubMembers.filter((cm) => cm.name && cm.name.toLowerCase().split(' ')[0] === firstName);
          if (sharedFirst.length > 1) {
            assignedMember = m.name.split(' ')[0];
          } else {
            assignedMember = m.name;
          }
          break;
        }
      }

      let deadlineText = null;
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'tomorrow', 'next week', 'tonight', 'eod'];
      for (const d of days) {
        if (lower.includes(d)) {
          deadlineText = d.charAt(0).toUpperCase() + d.slice(1);
          break;
        }
      }

      let priority = 'medium';
      if (lower.includes('urgent') || lower.includes('asap') || lower.includes('immediately')) {
        priority = 'urgent';
      } else if (lower.includes('important') || lower.includes('priority') || lower.includes('critical')) {
        priority = 'high';
      }

      let title = sentence.replace(/^[A-Za-z\s]+:\s*/, '').trim();
      if (title.length > 100) title = title.substring(0, 97) + '...';

      actionItems.push({
        title,
        description: sentence,
        assignedToName: assignedMember,
        deadlineText,
        priority,
        confidence: 0.85
      });
    }
  }

  const keyDecisions = sentences
    .filter((s) => s.toLowerCase().includes('decided') || s.toLowerCase().includes('agreed') || s.toLowerCase().includes('approved'))
    .map((s) => s.replace(/^[A-Za-z\s]+:\s*/, '').trim());

  return {
    actionItems,
    keyDecisions,
    detectedRisks: []
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

  let rawAiResult;
  try {
    rawAiResult = await generateStructured(prompt, {
      workflow: 'meetingProcessor',
      systemInstruction: 'You are an accurate, deterministic meeting analyst that outputs pure JSON matching the requested schema without conversational filler.'
    });
  } catch (err) {
    console.warn(`[Meeting AI] Upstream Gemini failed (${err.message}). Using deterministic rule-based extractor.`);
    rawAiResult = deterministicFallbackExtraction(transcriptText, clubMembers);
  }

  return normalizeExtractionResult(rawAiResult, clubMembers);
};

module.exports = {
  resolveMemberOwner,
  normalizeExtractionResult,
  processTranscript
};
