// Resolution Agent
// Decides if ticket can be auto-resolved
// Output: canResolve, confidence, resolutionSteps, usedFallback, reasoning
//
// KEY PRINCIPLE: Do NOT block auto-resolution if Knowledge Service is unavailable.
// Use fallback heuristics for routine issues.

const axios = require('axios');


// Fallback resolution steps for routine issues
const FALLBACK_RESOLUTIONS = {
  'forgot password': {
    steps: '1. Click "Forgot Password" on the login page\n2. Enter your email address\n3. Check your email for reset link\n4. Click the link and create a new password',
    confidence: 0.9
  },
  'reset password': {
    steps: '1. Click "Forgot Password" on the login page\n2. Enter your email address\n3. Check your email for reset link\n4. Click the link and create a new password',
    confidence: 0.9
  },
  'password reset': {
    steps: '1. Click "Forgot Password" on the login page\n2. Enter your email address\n3. Check your email for reset link\n4. Click the link and create a new password',
    confidence: 0.9
  },
  'login help': {
    steps: '1. Clear browser cache and cookies\n2. Try using a different browser\n3. Ensure caps lock is off\n4. If still unable to login, use "Forgot Password" to reset',
    confidence: 0.85
  },
  'can\'t login': {
    steps: '1. Clear browser cache and cookies\n2. Try using a different browser\n3. Ensure caps lock is off\n4. If still unable to login, use "Forgot Password" to reset',
    confidence: 0.85
  },
  'unable to login': {
    steps: '1. Clear browser cache and cookies\n2. Try using a different browser\n3. Ensure caps lock is off\n4. If still unable to login, use "Forgot Password" to reset',
    confidence: 0.85
  },
  'update profile': {
    steps: '1. Go to Settings > Profile\n2. Click "Edit Profile"\n3. Make your changes\n4. Click "Save Changes"',
    confidence: 0.8
  },
  'change email': {
    steps: '1. Go to Settings > Account\n2. Click "Change Email"\n3. Enter new email and verify\n4. Confirm the change',
    confidence: 0.8
  }
};

async function resolveTicket(ticket, classifierResult, knowledgeServiceUrl) {
  const text = `${ticket.title} ${ticket.description}`.toLowerCase();
  
  // PRIORITY 1: If it's a routine issue with good confidence, auto-resolve with fallback
  if (classifierResult.isRoutineIssue && classifierResult.confidence >= 0.75) {
    // Try to find matching fallback resolution
    for (const [key, resolution] of Object.entries(FALLBACK_RESOLUTIONS)) {
      if (text.includes(key)) {
        return {
          canResolve: true,
          confidence: resolution.confidence,
          resolutionSteps: resolution.steps,
          usedFallback: true,
          reasoning: `Routine issue detected with high confidence (${classifierResult.confidence}). Using fallback resolution steps for "${key}". This is a safe, common request that can be auto-resolved.`
        };
      }
    }
    
    // Generic routine issue resolution
    return {
      canResolve: true,
      confidence: 0.8,
      resolutionSteps: 'This appears to be a routine account issue. Please check our help documentation or contact support if you need further assistance.',
      usedFallback: true,
      reasoning: `Routine issue detected (confidence: ${classifierResult.confidence}). Using generic fallback resolution.`
    };
  }
  
  // PRIORITY 2: Try Knowledge Service (non-blocking)
  let kbResult = null;
  if (knowledgeServiceUrl) {
    try {
      const q = encodeURIComponent(ticket.title + ' ' + ticket.description);
      const res = await axios.get(`${knowledgeServiceUrl}/knowledge/search?q=${q}`, {
        timeout: 3000 // 3 second timeout - don't wait too long
      });
      const articles = res.data;
      if (articles && articles.length > 0) {
        kbResult = {
          canResolve: true,
          confidence: 0.85,
          resolutionSteps: `Refer to knowledge base article: ${articles[0].title}\n\n${articles[0].content || 'See article for details.'}`,
          usedFallback: false,
          reasoning: `Found relevant knowledge base article: "${articles[0].title}".`
        };
      }
    } catch (err) {
      // Knowledge Service unavailable - continue with fallback logic
      console.warn('Knowledge Service unavailable, using fallback logic');
    }
  }
  
  // If KB found something, use it
  if (kbResult) {
    return kbResult;
  }
  
  // PRIORITY 3: For non-routine issues with low confidence, cannot auto-resolve
  if (!classifierResult.isRoutineIssue && classifierResult.confidence < 0.65) {
    return {
      canResolve: false,
      confidence: 0.4,
      resolutionSteps: '',
      usedFallback: false,
      reasoning: `Non-routine issue with low classification confidence (${classifierResult.confidence}). Cannot safely auto-resolve without more information.`
    };
  }
  
  // PRIORITY 4: Default - cannot auto-resolve
  return {
    canResolve: false,
    confidence: 0.5,
    resolutionSteps: '',
    usedFallback: false,
    reasoning: 'Issue does not match known routine patterns and no knowledge base article found. Requires human review.'
  };
}

module.exports = { resolveTicket };
