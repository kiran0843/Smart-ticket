// Ticket routes
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

router.post('/', ticketController.createTicket);
router.get('/agent-status', ticketController.checkAgentStatus);
router.get('/:id', ticketController.getTicketById);
router.patch('/:id/status', ticketController.updateTicketStatus);
router.post('/:id/reprocess', ticketController.reprocessTicket);

module.exports = router;
