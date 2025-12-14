// AgentDecisionLog model
const mongoose = require('mongoose');

const AgentDecisionLogSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  agent: { type: String, required: true },
  decision: { type: String, required: true },
  confidence: { type: Number },
  explanation: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AgentDecisionLog', AgentDecisionLogSchema);
