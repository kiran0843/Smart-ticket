// Agent Orchestrator routes
const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'agent-orchestrator-service' });
});

router.post('/process-ticket', agentController.processTicket);

module.exports = router;
