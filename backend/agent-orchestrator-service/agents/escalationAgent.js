// Escalation Agent
// Decides if escalation is needed based on RISK and UNCERTAINTY, NOT priority
// Output: escalate (bool), escalationReason, explanation
//
// KEY PRINCIPLE: Escalate ONLY when:
// - riskLevel === "high" (security/financial risk)
// - classifier confidence < 0.65 (high uncertainty)
// - resolution confidence < 0.6 (cannot safely resolve)
// - non-routine issue that cannot be auto-resolved
//
// DO NOT escalate purely because priority is high.

function checkEscalation(classifierResult, resolutionResult, riskEvaluation) {
  let escalate = false;
  let reasons = [];
  
  // RULE 1: High risk ALWAYS escalates (security, financial, fraud)
  if (riskEvaluation.riskLevel === 'high') {
    escalate = true;
    reasons.push(`High risk: ${riskEvaluation.riskReasoning}`);
  }
  
  // RULE 2: Low classifier confidence = high uncertainty (escalate)
  if (classifierResult.confidence < 0.65) {
    escalate = true;
    reasons.push(`Low classification confidence (${classifierResult.confidence}): High uncertainty requires human review`);
  }
  
  // RULE 3: Low resolution confidence = cannot safely resolve (escalate)
  if (resolutionResult.confidence < 0.6) {
    escalate = true;
    reasons.push(`Low resolution confidence (${resolutionResult.confidence}): Cannot safely auto-resolve`);
  }
  
  // RULE 4: Non-routine issue that cannot be auto-resolved (escalate)
  if (!classifierResult.isRoutineIssue && !resolutionResult.canResolve) {
    escalate = true;
    reasons.push(`Non-routine issue cannot be auto-resolved: Requires human expertise`);
  }
  
  // DO NOT escalate routine issues that can be resolved
  // DO NOT escalate based on priority alone
  
  const reason = reasons.length > 0 ? reasons.join('; ') : '';
  return {
    escalate,
    escalationReason: reason,
    explanation: escalate 
      ? `Escalation triggered: ${reason}` 
      : 'No escalation needed. Ticket can be safely processed automatically.'
  };
}

module.exports = { checkEscalation };
