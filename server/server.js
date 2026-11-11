const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/db');
const jobsRoutes = require('./routes/jobsRoutes');
const applicationsRoutes = require('./routes/applicationsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
const clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));

// API Routes
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);

// Fallback for SPA routing to client index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// 404 Handler for undefined API routes
app.use('/api/*', notFoundHandler);

// Catch-all route to serve frontend index.html for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// Centralized error handler
app.use(errorHandler);

// Start server
async function startServer() {
  console.log('Testing MySQL database connection...');
  const dbStatus = await testConnection();

  if (dbStatus.connected) {
    console.log(`✓ Database connected successfully (MySQL version ${dbStatus.version})`);
  } else {
    console.warn(`! Warning: Database connection check failed: ${dbStatus.error}`);
    console.warn('  Ensure MySQL is running and credentials in .env are correct.');
  }

  const server = app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`  HireSphere Recruitment Management Platform`);
    console.log(`  Server running at: http://localhost:${PORT}`);
    console.log(`  Environment:       ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Database Host:     ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    console.log(`  Database Name:     ${process.env.DB_NAME || 'jobs'}`);
    console.log(`==================================================\n`);
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
