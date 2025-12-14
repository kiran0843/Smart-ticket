// Feedback Agent
// Logs outcomes and can update rules (simple, no ML)

const mongoose = require('mongoose');
const AgentDecisionLog = require('../../ticket-service/models/AgentDecisionLog');

// ✅ NO connectDB() here — DB is connected in index.js

async function logOutcome(ticketId, outcome) {
  try {
    if (!ticketId) return;

    // ✅ If DB is not connected, silently skip (non-critical)
    if (mongoose.connection.readyState !== 1) {
      return;
    }

    const { classifierResult, riskEvaluation, resolutionResult, escalationResult } = outcome;

    if (classifierResult) {
      await AgentDecisionLog.create({
        ticketId: new mongoose.Types.ObjectId(ticketId),
        agent: 'Classifier',
        decision: `${classifierResult.category} - ${classifierResult.priority} priority${classifierResult.isRoutineIssue ? ' (Routine)' : ''}`,
        confidence: classifierResult.confidence,
        explanation: classifierResult.explanation
      });
    }

    if (riskEvaluation) {
      await AgentDecisionLog.create({
        ticketId: new mongoose.Types.ObjectId(ticketId),
        agent: 'Risk Evaluator',
        decision: `Risk Level: ${riskEvaluation.riskLevel}`,
        confidence: 0.85,
        explanation: riskEvaluation.riskReasoning
      });
    }

    if (resolutionResult) {
      await AgentDecisionLog.create({
        ticketId: new mongoose.Types.ObjectId(ticketId),
        agent: 'Resolution',
        decision: resolutionResult.canResolve
          ? `Can Auto-Resolve${resolutionResult.usedFallback ? ' (Fallback)' : ''}`
          : 'Cannot Auto-Resolve',
        confidence: resolutionResult.confidence,
        explanation: resolutionResult.reasoning || resolutionResult.explanation
      });
    }

    if (escalationResult) {
      await AgentDecisionLog.create({
        ticketId: new mongoose.Types.ObjectId(ticketId),
        agent: 'Escalation',
        decision: escalationResult.escalate ? 'Escalate to Human' : 'No Escalation Needed',
        confidence: escalationResult.escalate ? 0.9 : 0.7,
        explanation: escalationResult.explanation
      });
    }

  } catch (err) {
    console.error('Error logging agent outcome:', err.message);
  }
}

async function getLogs(ticketId) {
  try {
    if (mongoose.connection.readyState !== 1) return [];

    if (ticketId) {
      return await AgentDecisionLog.find({
        ticketId: new mongoose.Types.ObjectId(ticketId)
      }).sort({ timestamp: -1 });
    }

    return await AgentDecisionLog.find()
      .sort({ timestamp: -1 })
      .limit(100);
  } catch (err) {
    console.error('Error fetching logs:', err.message);
    return [];
  }
}

module.exports = { logOutcome, getLogs };
