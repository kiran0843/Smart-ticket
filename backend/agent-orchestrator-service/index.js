// Entry point for Agent Orchestrator Service
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('../shared/db');

const app = express();
const agentRoutes = require('./routes/agentRoutes');

app.use(cors());
app.use(express.json());
app.use('/agents', agentRoutes);

const PORT = process.env.AGENT_ORCHESTRATOR_PORT || process.env.PORT || 4002;

// ✅ CONNECT MONGODB BEFORE STARTING SERVER
(async () => {
  await connectDB(); // non-fatal if DB is down
  app.listen(PORT, () => {
    console.log(`Agent Orchestrator Service running on port ${PORT}`);
  });
})();
