// Ticket model
const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Received', 'auto_resolved', 'escalated', 'awaiting_clarification'], 
    default: 'Received' 
  },
  category: { type: String },
  priority: { type: String, enum: ['low', 'medium', 'high'] },
  isRoutineIssue: { type: Boolean, default: false },
  riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
  agentDecisions: [
    {
      agent: String,
      decision: String,
      confidence: Number,
      explanation: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  resolutionSteps: { type: String },
  resolutionUsedFallback: { type: Boolean, default: false },
  escalationReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', TicketSchema);
