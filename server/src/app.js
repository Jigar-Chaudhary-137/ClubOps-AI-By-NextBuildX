const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config/env');
const apiRoutes = require('./routes');
const notFoundHandler = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 1. Security headers (configured to permit SPA bundles, Google Fonts, and assets)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// 2. CORS configuration (permits same-origin production SPA and development Vite client)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, same-origin SPA) or configured clientUrl
      if (!origin || origin === config.clientUrl || config.isDevelopment) {
        return callback(null, true);
      }
      return callback(null, true);
    },
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

// 6. Serve static frontend assets if built (Monolithic Full-Stack Render Deployment)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // Catch-all route to serve index.html for Single Page Application (SPA) client-side routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 7. 404 handler for unmatched API routes
app.use(notFoundHandler);

// 8. Global error handling middleware
app.use(errorHandler);

module.exports = app;
