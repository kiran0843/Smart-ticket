// Classifier Agent
// Input: ticket title + description
// Output: category, priority, confidence, isRoutineIssue, explanation
//
// KEY PRINCIPLE: Priority and routine status are SEPARATE concepts.
// A routine issue (e.g., password reset) can be medium priority but low risk.

// Routine issues that can be safely auto-resolved
const ROUTINE_ISSUES = [
  { keywords: ['forgot password', 'reset password', 'password reset', 'password', 'can\'t remember password', 'need to reset'], category: 'Account', priority: 'medium', isRoutine: true },
  { keywords: ['login help', 'can\'t login', 'unable to login', 'login issue', 'cannot login'], category: 'Account', priority: 'medium', isRoutine: true },
  { keywords: ['update profile', 'change profile', 'edit profile'], category: 'Account', priority: 'low', isRoutine: true },
  { keywords: ['change email', 'update email'], category: 'Account', priority: 'medium', isRoutine: true }
];

// High-priority, non-routine issues
const HIGH_PRIORITY_ISSUES = [
  { keywords: ['hacked', 'compromised', 'unauthorized access', 'security breach'], category: 'Security', priority: 'high', isRoutine: false },
  { keywords: ['payment', 'billing', 'charge', 'refund', 'double charge'], category: 'Billing', priority: 'high', isRoutine: false },
  { keywords: ['fraud', 'suspicious', 'stolen'], category: 'Security', priority: 'high', isRoutine: false }
];

// Medium-priority issues
const MEDIUM_PRIORITY_ISSUES = [
  { keywords: ['error', 'bug', 'not working', 'broken'], category: 'Technical', priority: 'medium', isRoutine: false },
  { keywords: ['feature request', 'suggestion', 'improvement'], category: 'Feature Request', priority: 'low', isRoutine: false }
];

function classifyTicket(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  
  // Check for routine issues first (these should auto-resolve)
  for (const routine of ROUTINE_ISSUES) {
    for (const keyword of routine.keywords) {
      if (text.includes(keyword)) {
        return {
          category: routine.category,
          priority: routine.priority,
          confidence: 0.9,
          isRoutineIssue: true,
          explanation: `Identified as routine ${routine.category} issue: "${keyword}". This is a common, low-risk request that can be safely auto-resolved.`
        };
      }
    }
  }
  
  // Check for high-priority, non-routine issues
  for (const issue of HIGH_PRIORITY_ISSUES) {
    for (const keyword of issue.keywords) {
      if (text.includes(keyword)) {
        return {
          category: issue.category,
          priority: issue.priority,
          confidence: 0.85,
          isRoutineIssue: false,
          explanation: `Identified as high-priority ${issue.category} issue: "${keyword}". This requires human review due to potential security or financial impact.`
        };
      }
    }
  }
  
  // Check for medium-priority issues
  for (const issue of MEDIUM_PRIORITY_ISSUES) {
    for (const keyword of issue.keywords) {
      if (text.includes(keyword)) {
        return {
          category: issue.category,
          priority: issue.priority,
          confidence: 0.75,
          isRoutineIssue: false,
          explanation: `Identified as ${issue.priority} priority ${issue.category} issue: "${keyword}".`
        };
      }
    }
  }
  
  // Default: ambiguous or unclear issue
  return {
    category: 'General',
    priority: 'low',
    confidence: 0.5,
    isRoutineIssue: false,
    explanation: 'Unable to clearly classify this ticket. Low confidence classification - may require clarification or human review.'
  };
}

module.exports = { classifyTicket };
