const { pool } = require('../config/db');

// GET /api/applications - List all applications with filters
async function getAllApplications(req, res, next) {
  try {
    const { search, status, job_id } = req.query;

    let query = `
      SELECT 
        a.id,
        a.job_id,
        a.applicant_name,
        a.applicant_email,
        a.resume_url,
        a.application_status,
        a.applied_at,
        j.job_title,
        j.company_name,
        j.location AS job_location,
        j.employment_type AS job_employment_type
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (a.applicant_name LIKE ? OR a.applicant_email LIKE ? OR j.job_title LIKE ? OR j.company_name LIKE ?)`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (status && status.trim() && status !== 'all') {
      query += ` AND a.application_status = ?`;
      params.push(status.trim());
    }

    if (job_id && !isNaN(parseInt(job_id, 10)) && parseInt(job_id, 10) > 0) {
      query += ` AND a.job_id = ?`;
      params.push(parseInt(job_id, 10));
    }

    query += ` ORDER BY a.applied_at DESC`;

    const [applications] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/applications/:id - Get single application with job details
async function getApplicationById(req, res, next) {
  try {
    const applicationId = parseInt(req.params.id, 10);
    if (isNaN(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format'
      });
    }

    const [applications] = await pool.query(
      `SELECT 
        a.id,
        a.job_id,
        a.applicant_name,
        a.applicant_email,
        a.resume_url,
        a.application_status,
        a.applied_at,
        j.job_title,
        j.company_name,
        j.location AS job_location,
        j.employment_type AS job_employment_type,
        j.salary AS job_salary,
        j.skills AS job_skills
       FROM applications a
       INNER JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ?`,
      [applicationId]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Application with ID ${applicationId} not found`
      });
    }

    res.status(200).json({
      success: true,
      data: applications[0]
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/applications - Submit new application
async function createApplication(req, res, next) {
  try {
    const { job_id, applicant_name, applicant_email, resume_url, application_status } = req.cleanedBody;

    // Check that referenced job exists
    const [job] = await pool.query('SELECT id, job_title, company_name FROM jobs WHERE id = ?', [job_id]);
    if (job.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot create application: Referenced job with ID ${job_id} does not exist.`
      });
    }

    const [result] = await pool.query(
      `INSERT INTO applications (job_id, applicant_name, applicant_email, resume_url, application_status)
       VALUES (?, ?, ?, ?, ?)`,
      [job_id, applicant_name, applicant_email, resume_url, application_status || 'Pending']
    );

    const [newApp] = await pool.query(
      `SELECT 
        a.*,
        j.job_title,
        j.company_name
       FROM applications a
       INNER JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: newApp[0]
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/applications/:id - Update full application
async function updateApplication(req, res, next) {
  try {
    const applicationId = parseInt(req.params.id, 10);
    if (isNaN(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format'
      });
    }

    const [existing] = await pool.query('SELECT id FROM applications WHERE id = ?', [applicationId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Application with ID ${applicationId} not found`
      });
    }

    const { job_id, applicant_name, applicant_email, resume_url, application_status } = req.cleanedBody;

    // Validate job exists
    const [job] = await pool.query('SELECT id FROM jobs WHERE id = ?', [job_id]);
    if (job.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Referenced job with ID ${job_id} does not exist.`
      });
    }

    await pool.query(
      `UPDATE applications
       SET job_id = ?,
           applicant_name = ?,
           applicant_email = ?,
           resume_url = ?,
           application_status = ?
       WHERE id = ?`,
      [job_id, applicant_name, applicant_email, resume_url, application_status, applicationId]
    );

    const [updatedApp] = await pool.query(
      `SELECT 
        a.*,
        j.job_title,
        j.company_name
       FROM applications a
       INNER JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ?`,
      [applicationId]
    );

    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: updatedApp[0]
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/applications/:id/status - Update only status
async function updateApplicationStatus(req, res, next) {
  try {
    const applicationId = parseInt(req.params.id, 10);
    if (isNaN(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format'
      });
    }

    const [existing] = await pool.query('SELECT id, applicant_name FROM applications WHERE id = ?', [applicationId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Application with ID ${applicationId} not found`
      });
    }

    const { application_status } = req.cleanedBody;

    await pool.query(
      `UPDATE applications SET application_status = ? WHERE id = ?`,
      [application_status, applicationId]
    );

    const [updatedApp] = await pool.query(
      `SELECT 
        a.*,
        j.job_title,
        j.company_name
       FROM applications a
       INNER JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ?`,
      [applicationId]
    );

    res.status(200).json({
      success: true,
      message: `Application status updated to ${application_status}`,
      data: updatedApp[0]
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/applications/:id - Delete application
async function deleteApplication(req, res, next) {
  try {
    const applicationId = parseInt(req.params.id, 10);
    if (isNaN(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format'
      });
    }

    const [existing] = await pool.query('SELECT id, applicant_name FROM applications WHERE id = ?', [applicationId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Application with ID ${applicationId} not found`
      });
    }

    await pool.query('DELETE FROM applications WHERE id = ?', [applicationId]);

    res.status(200).json({
      success: true,
      message: `Application for "${existing[0].applicant_name}" was deleted successfully`,
      deletedId: applicationId
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication
};
