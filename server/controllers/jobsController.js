const { pool } = require('../config/db');

// GET /api/jobs - List all jobs with filters and search
async function getAllJobs(req, res, next) {
  try {
    const { search, location, employment_type } = req.query;

    let query = `
      SELECT 
        j.id,
        j.job_title,
        j.company_name,
        j.description,
        j.skills,
        j.location,
        j.employment_type,
        j.salary,
        j.created_at,
        COUNT(a.id) AS applications_count
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (j.job_title LIKE ? OR j.company_name LIKE ? OR j.skills LIKE ? OR j.description LIKE ?)`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (location && location.trim() && location !== 'all') {
      query += ` AND j.location LIKE ?`;
      params.push(`%${location.trim()}%`);
    }

    if (employment_type && employment_type.trim() && employment_type !== 'all') {
      query += ` AND j.employment_type = ?`;
      params.push(employment_type.trim());
    }

    query += ` GROUP BY j.id ORDER BY j.created_at DESC`;

    const [jobs] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/jobs/:id - Get single job with details and applicant list
async function getJobById(req, res, next) {
  try {
    const jobId = parseInt(req.params.id, 10);
    if (isNaN(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format'
      });
    }

    // Fetch job
    const [jobs] = await pool.query(
      `SELECT 
        j.*,
        COUNT(a.id) AS applications_count
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      WHERE j.id = ?
      GROUP BY j.id`,
      [jobId]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Job with ID ${jobId} not found`
      });
    }

    // Fetch linked applications
    const [applications] = await pool.query(
      `SELECT id, applicant_name, applicant_email, resume_url, application_status, applied_at
       FROM applications
       WHERE job_id = ?
       ORDER BY applied_at DESC`,
      [jobId]
    );

    const job = jobs[0];
    job.applications = applications;

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/jobs - Create a new job
async function createJob(req, res, next) {
  try {
    const { job_title, company_name, description, skills, location, employment_type, salary } = req.cleanedBody;

    const [result] = await pool.query(
      `INSERT INTO jobs (job_title, company_name, description, skills, location, employment_type, salary)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [job_title, company_name, description, skills, location, employment_type, salary]
    );

    const [newJob] = await pool.query(
      `SELECT *, 0 AS applications_count FROM jobs WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      data: newJob[0]
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/jobs/:id - Update an existing job
async function updateJob(req, res, next) {
  try {
    const jobId = parseInt(req.params.id, 10);
    if (isNaN(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format'
      });
    }

    // Verify job exists
    const [existing] = await pool.query('SELECT id FROM jobs WHERE id = ?', [jobId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Job with ID ${jobId} not found`
      });
    }

    const { job_title, company_name, description, skills, location, employment_type, salary } = req.cleanedBody;

    await pool.query(
      `UPDATE jobs
       SET job_title = ?,
           company_name = ?,
           description = ?,
           skills = ?,
           location = ?,
           employment_type = ?,
           salary = ?
       WHERE id = ?`,
      [job_title, company_name, description, skills, location, employment_type, salary, jobId]
    );

    const [updatedJob] = await pool.query(
      `SELECT j.*, COUNT(a.id) AS applications_count 
       FROM jobs j 
       LEFT JOIN applications a ON j.id = a.job_id 
       WHERE j.id = ?
       GROUP BY j.id`,
      [jobId]
    );

    res.status(200).json({
      success: true,
      message: 'Job posting updated successfully',
      data: updatedJob[0]
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/jobs/:id - Delete a job (cascades to applications)
async function deleteJob(req, res, next) {
  try {
    const jobId = parseInt(req.params.id, 10);
    if (isNaN(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format'
      });
    }

    const [existing] = await pool.query('SELECT id, job_title FROM jobs WHERE id = ?', [jobId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Job with ID ${jobId} not found`
      });
    }

    await pool.query('DELETE FROM jobs WHERE id = ?', [jobId]);

    res.status(200).json({
      success: true,
      message: `Job "${existing[0].job_title}" and all related applications were deleted successfully`,
      deletedId: jobId
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
};
