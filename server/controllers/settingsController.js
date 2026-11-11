const { pool, testConnection } = require('../config/db');

// GET /api/settings/status - Server & Database status info
async function getSettingsStatus(req, res, next) {
  try {
    const dbStatus = await testConnection();

    let dbDetails = {
      connected: dbStatus.connected,
      database_name: process.env.DB_NAME || 'jobs',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '3306',
      user: process.env.DB_USER || 'root',
      server_version: dbStatus.connected ? dbStatus.version : 'Unavailable',
      error: dbStatus.connected ? null : dbStatus.error
    };

    let counts = {
      jobs: 0,
      applications: 0
    };

    if (dbStatus.connected) {
      const [[{ jobCount }]] = await pool.query('SELECT COUNT(*) AS jobCount FROM jobs');
      const [[{ appCount }]] = await pool.query('SELECT COUNT(*) AS appCount FROM applications');
      counts.jobs = jobCount;
      counts.applications = appCount;
    }

    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const memUsage = process.memoryUsage();

    res.status(200).json({
      success: true,
      data: {
        application: {
          name: 'HireSphere',
          tagline: 'Job & Application Management System',
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          node_version: process.version,
          platform: process.platform,
          uptime: `${hours}h ${minutes}m ${seconds}s`,
          uptime_seconds: Math.floor(uptime),
          memory_rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
          memory_heap: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
          timestamp: new Date().toISOString()
        },
        database: {
          ...dbDetails,
          total_jobs: counts.jobs,
          total_applications: counts.applications
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSettingsStatus
};
