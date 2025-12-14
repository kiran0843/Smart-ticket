// Route to get all tickets (for admin dashboard)
const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const connectDB = require('../../shared/db');

connectDB();

router.get('/', async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tickets.' });
  }
});

module.exports = router;
