const { pool } = require('../config/db');

// GET /api/dashboard/stats - Aggregate metrics directly from MySQL
async function getDashboardStats(req, res, next) {
  try {
    // 1. Total jobs
    const [[{ total_jobs }]] = await pool.query('SELECT COUNT(*) AS total_jobs FROM jobs');

    // 2. Total applications
    const [[{ total_applications }]] = await pool.query('SELECT COUNT(*) AS total_applications FROM applications');

    // 3. Applications status breakdown
    const [statusRows] = await pool.query(`
      SELECT 
        application_status, 
        COUNT(*) AS count 
      FROM applications 
      GROUP BY application_status
    `);

    // Standardize status breakdown
    const statusMap = {
      Pending: 0,
      Reviewed: 0,
      Shortlisted: 0,
      Rejected: 0,
      Hired: 0
    };

    statusRows.forEach(row => {
      if (statusMap.hasOwnProperty(row.application_status)) {
        statusMap[row.application_status] = row.count;
      }
    });

    const pending_applications = statusMap.Pending;
    const shortlisted_applications = statusMap.Shortlisted;

    // 4. Recent jobs (latest 5)
    const [recent_jobs] = await pool.query(`
      SELECT 
        j.id,
        j.job_title,
        j.company_name,
        j.location,
        j.employment_type,
        j.salary,
        j.created_at,
        COUNT(a.id) AS applications_count
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      GROUP BY j.id
      ORDER BY j.created_at DESC
      LIMIT 5
    `);

    // 5. Recent applications (latest 5)
    const [recent_applications] = await pool.query(`
      SELECT 
        a.id,
        a.job_id,
        a.applicant_name,
        a.applicant_email,
        a.resume_url,
        a.application_status,
        a.applied_at,
        j.job_title,
        j.company_name
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      ORDER BY a.applied_at DESC
      LIMIT 5
    `);

    // 6. Applications per job (top 5 active pipelines for charts)
    const [jobs_by_applications] = await pool.query(`
      SELECT 
        j.id,
        j.job_title,
        j.company_name,
        COUNT(a.id) AS applications_count
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      GROUP BY j.id
      ORDER BY applications_count DESC, j.created_at DESC
      LIMIT 6
    `);

    // 7. Employment type distribution
    const [employment_type_distribution] = await pool.query(`
      SELECT 
        employment_type, 
        COUNT(*) AS count 
      FROM jobs 
      GROUP BY employment_type
    `);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total_jobs,
          total_applications,
          pending_applications,
          shortlisted_applications,
          hired_applications: statusMap.Hired,
          reviewed_applications: statusMap.Reviewed,
          rejected_applications: statusMap.Rejected
        },
        status_breakdown: statusMap,
        recent_jobs,
        recent_applications,
        jobs_by_applications,
        employment_type_distribution
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats
};
