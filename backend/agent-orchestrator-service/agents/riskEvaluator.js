// Risk Evaluator
// Evaluates risk level independently from priority
// Output: riskLevel (low / medium / high), riskReasoning
//
// KEY PRINCIPLE: Risk is about potential harm/impact, NOT urgency.
// A routine password reset is low risk even if medium priority.

function evaluateRisk(classifierResult, ticketText) {
  const { category, isRoutineIssue, priority } = classifierResult;
  
  // HIGH RISK: Security breaches, financial fraud, data loss
  // Note: We need the original ticket text to check for risk indicators
  const text = (ticketText || '').toLowerCase();
  
  const highRiskIndicators = [
    'hacked', 'compromised', 'unauthorized', 'breach', 'fraud',
    'stolen', 'suspicious', 'unauthorized access', 'data leak'
  ];
  
  // Check if any high-risk keywords are present in ticket text
  for (const indicator of highRiskIndicators) {
    if (text.includes(indicator)) {
      return {
        riskLevel: 'high',
        riskReasoning: `High risk detected: Security or financial impact potential. This requires immediate human review regardless of priority.`
      };
    }
  }
  
  // HIGH RISK: Billing/financial issues (double charges, unauthorized payments)
  if (category === 'Billing' && (priority === 'high' || text.includes('charge') || text.includes('payment'))) {
    return {
      riskLevel: 'high',
      riskReasoning: `High risk: Financial transaction issue. Requires human verification to prevent financial loss.`
    };
  }
  
  // HIGH RISK: Security category with high priority
  if (category === 'Security' && priority === 'high') {
    return {
      riskLevel: 'high',
      riskReasoning: `High risk: Security-related issue with high priority. Requires immediate human review.`
    };
  }
  
  // LOW RISK: Routine issues are always low risk
  if (isRoutineIssue) {
    return {
      riskLevel: 'low',
      riskReasoning: `Low risk: Routine ${category} issue. These are common, well-understood requests with standard resolution procedures.`
    };
  }
  
  // MEDIUM RISK: Non-routine issues with good classification confidence
  if (!isRoutineIssue && classifierResult.confidence >= 0.7) {
    return {
      riskLevel: 'medium',
      riskReasoning: `Medium risk: Non-routine ${category} issue. Well-classified but requires verification before auto-resolution.`
    };
  }
  
  // MEDIUM RISK: Ambiguous issues
  if (classifierResult.confidence < 0.65) {
    return {
      riskLevel: 'medium',
      riskReasoning: `Medium risk: Low classification confidence (${classifierResult.confidence}). Uncertainty requires human review to prevent incorrect resolution.`
    };
  }
  
  // DEFAULT: Medium risk for unknown cases
  return {
    riskLevel: 'medium',
    riskReasoning: `Medium risk: Standard non-routine issue. Requires human review to ensure appropriate handling.`
  };
}

module.exports = { evaluateRisk };

