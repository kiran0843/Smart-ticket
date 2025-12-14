// Entry point for Knowledge Service
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const app = express();
const knowledgeRoutes = require('./routes/knowledgeRoutes');
const db = require('../shared/db');

app.use(cors());
app.use(express.json());
app.use('/knowledge', knowledgeRoutes);

const PORT = process.env.KNOWLEDGE_SERVICE_PORT || process.env.PORT || 4003;
app.listen(PORT, () => {
  console.log(`Knowledge Service running on port ${PORT}`);
});
