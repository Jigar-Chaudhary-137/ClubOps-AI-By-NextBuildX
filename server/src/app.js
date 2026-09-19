const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config/env');
const apiRoutes = require('./routes');
const notFoundHandler = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 1. Security headers
app.use(helmet());

// 2. CORS configuration
app.use(
  cors({
    origin: config.clientUrl || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Type', 'Authorization']
  })
);

// 3. Request logger
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// 4. Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Mount API routes
app.use('/api', apiRoutes);

// 6. 404 handler for unmatched routes
app.use(notFoundHandler);

// 7. Global error handling middleware
app.use(errorHandler);

module.exports = app;
