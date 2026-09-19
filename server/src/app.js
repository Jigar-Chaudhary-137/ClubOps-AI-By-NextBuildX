const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Base health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'ClubOps AI Server running',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
