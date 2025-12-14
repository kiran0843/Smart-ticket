// Entry point for Ticket Service
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const app = express();

const ticketRoutes = require('./routes/ticketRoutes');
const allTicketsRoute = require('./routes/allTicketsRoute');
const db = require('../shared/db');

app.use(cors());
app.use(express.json());
app.use('/tickets', ticketRoutes);
app.use('/tickets', allTicketsRoute);

const PORT = process.env.TICKET_SERVICE_PORT || process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Ticket Service running on port ${PORT}`);
});
