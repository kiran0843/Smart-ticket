// Ticket controller
const Ticket = require('../models/Ticket');
const connectDB = require('../../shared/db');
const axios = require('axios');

// Connect to DB on controller load
connectDB();

// URL for agent orchestrator service
// Check if agent orchestrator is using PORT from env, or use service-specific port
const AGENT_ORCHESTRATOR_PORT = process.env.AGENT_ORCHESTRATOR_PORT || process.env.PORT || 4002;
const AGENT_ORCHESTRATOR_URL = process.env.AGENT_ORCHESTRATOR_URL || `http://localhost:${AGENT_ORCHESTRATOR_PORT}`;

// Log the agent orchestrator URL on startup
console.log(`🔗 Agent Orchestrator URL: ${AGENT_ORCHESTRATOR_URL}`);

exports.createTicket = async (req, res) => {
  try {
    console.log('POST /tickets body:', req.body);
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }
    const ticket = new Ticket({ title, description });
    await ticket.save();
    
    // Trigger agent processing asynchronously
    processTicketWithAgents(ticket._id.toString(), title, description).catch(err => {
      console.error('Agent processing error:', err);
    });
    
    res.status(201).json(ticket);
  } catch (err) {
    console.error('Ticket creation error:', err);
    res.status(500).json({ error: 'Failed to create ticket.' });
  }
};

// Helper function to process ticket with agents
async function processTicketWithAgents(ticketId, title, description) {
  try {
    console.log(`Processing ticket ${ticketId} with agents via ${AGENT_ORCHESTRATOR_URL}/agents/process-ticket`);
    // Call agent orchestrator service
    const response = await axios.post(`${AGENT_ORCHESTRATOR_URL}/agents/process-ticket`, {
      ticketId,
      title,
      description
    }, {
      timeout: 10000 // 10 second timeout
    });
    
    const { classifier, risk, resolution, escalation } = response.data;
    
    // Determine final status based on new logic
    let finalStatus;
    if (escalation.escalate) {
      // Check if it's low confidence (awaiting clarification) vs high risk (escalated)
      if (classifier.confidence < 0.65 && risk.riskLevel !== 'high') {
        finalStatus = 'awaiting_clarification';
      } else {
        finalStatus = 'escalated';
      }
    } else if (resolution.canResolve) {
      finalStatus = 'auto_resolved';
    } else {
      finalStatus = 'awaiting_clarification';
    }
    
    // Update ticket with agent decisions
    const updateData = {
      status: finalStatus,
      category: classifier.category,
      priority: classifier.priority,
      isRoutineIssue: classifier.isRoutineIssue || false,
      riskLevel: risk.riskLevel || 'medium',
      agentDecisions: [
        {
          agent: 'Classifier',
          decision: `${classifier.category} - ${classifier.priority} priority${classifier.isRoutineIssue ? ' (Routine)' : ''}`,
          confidence: classifier.confidence,
          explanation: classifier.explanation,
          timestamp: new Date()
        },
        {
          agent: 'Risk Evaluator',
          decision: `Risk Level: ${risk.riskLevel}`,
          confidence: 0.85,
          explanation: risk.riskReasoning,
          timestamp: new Date()
        },
        {
          agent: 'Resolution',
          decision: resolution.canResolve 
            ? `Can Auto-Resolve${resolution.usedFallback ? ' (Fallback)' : ''}` 
            : 'Cannot Auto-Resolve',
          confidence: resolution.confidence,
          explanation: resolution.reasoning,
          timestamp: new Date()
        },
        {
          agent: 'Escalation',
          decision: escalation.escalate ? 'Escalate to Human' : 'No Escalation Needed',
          confidence: escalation.escalate ? 0.9 : 0.7,
          explanation: escalation.explanation,
          timestamp: new Date()
        }
      ],
      resolutionSteps: resolution.resolutionSteps || '',
      resolutionUsedFallback: resolution.usedFallback || false,
      escalationReason: escalation.escalationReason || '',
      updatedAt: new Date()
    };
    
    await Ticket.findByIdAndUpdate(ticketId, updateData);
    console.log(`✅ Ticket ${ticketId} processed by agents. Status: ${updateData.status}`);
  } catch (err) {
    console.error('❌ Error processing ticket with agents:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error(`⚠️  Agent orchestrator service is not running at ${AGENT_ORCHESTRATOR_URL}`);
      console.error('💡 Make sure agent-orchestrator-service is running');
    }
    // Update ticket status to indicate processing failed
    await Ticket.findByIdAndUpdate(ticketId, {
      status: 'Received',
      updatedAt: new Date()
    }).catch(dbErr => {
      console.error('Error updating ticket status:', dbErr.message);
    });
  }
}

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ticket.' });
  }
};

// Check agent orchestrator service status
exports.checkAgentStatus = async (req, res) => {
  try {
    const healthUrl = AGENT_ORCHESTRATOR_URL.includes('/agents') 
      ? AGENT_ORCHESTRATOR_URL.replace('/agents/process-ticket', '/agents/health')
      : `${AGENT_ORCHESTRATOR_URL}/agents/health`;
    
    const testResponse = await axios.get(healthUrl, {
      timeout: 2000
    }).catch(() => null);
    
    res.json({
      agentOrchestratorUrl: AGENT_ORCHESTRATOR_URL,
      healthUrl: healthUrl,
      status: testResponse ? 'connected' : 'not_connected',
      message: testResponse 
        ? 'Agent orchestrator service is running' 
        : 'Agent orchestrator service is not accessible. Make sure it is running.'
    });
  } catch (err) {
    res.json({
      agentOrchestratorUrl: AGENT_ORCHESTRATOR_URL,
      status: 'error',
      message: `Error checking agent status: ${err.message}`
    });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status.' });
  }
};

// Manual trigger to reprocess a ticket with agents
exports.reprocessTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }
    
    console.log(`🔄 Manually reprocessing ticket ${req.params.id}`);
    // Process ticket with agents
    await processTicketWithAgents(ticket._id.toString(), ticket.title, ticket.description);
    
    // Fetch updated ticket
    const updatedTicket = await Ticket.findById(req.params.id);
    res.json({ 
      message: 'Ticket reprocessing initiated',
      ticket: updatedTicket 
    });
  } catch (err) {
    console.error('Error reprocessing ticket:', err);
    res.status(500).json({ error: 'Failed to reprocess ticket.' });
  }
};
