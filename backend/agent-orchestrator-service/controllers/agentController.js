// Agent Orchestrator controller
// Orchestrates the agent pipeline for ticket processing
const axios = require('axios');
const { classifyTicket } = require('../agents/classifierAgent');
const { resolveTicket } = require('../agents/resolutionAgent');
const { checkEscalation } = require('../agents/escalationAgent');
const { evaluateRisk } = require('../agents/riskEvaluator');
const { logOutcome } = require('../agents/feedbackAgent');

// URL for knowledge service (adjust if needed)
const KNOWLEDGE_SERVICE_URL = process.env.KNOWLEDGE_SERVICE_URL || 'http://localhost:4003';

exports.processTicket = async (req, res) => {
  try {
    const { title, description, ticketId } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description required.' });
    }
    
    // 1. Classifier Agent - Categorizes and identifies routine issues
    const classifierResult = classifyTicket(title, description);
    
    // 2. Risk Evaluator - Evaluates risk independently from priority
    const ticketText = `${title} ${description}`;
    const riskEvaluation = evaluateRisk(classifierResult, ticketText);
    
    // 3. Resolution Agent - Determines if can auto-resolve (with fallback heuristics)
    const resolutionResult = await resolveTicket(
      { title, description }, 
      classifierResult, 
      KNOWLEDGE_SERVICE_URL
    );
    
    // 4. Escalation Agent - Decides escalation based on risk/uncertainty, NOT priority
    const escalationResult = checkEscalation(classifierResult, resolutionResult, riskEvaluation);
    
    // 5. Feedback Agent logs outcome (async, don't wait)
    if (ticketId) {
      logOutcome(ticketId, {
        classifierResult,
        riskEvaluation,
        resolutionResult,
        escalationResult
      }).catch(err => console.error('Feedback logging error:', err));
    }
    
    // 6. Return full agent decision pipeline
    res.json({
      classifier: classifierResult,
      risk: riskEvaluation,
      resolution: resolutionResult,
      escalation: escalationResult
    });
  } catch (err) {
    console.error('Agent orchestration error:', err);
    res.status(500).json({ error: 'Agent orchestration failed.', details: err.message });
  }
};
