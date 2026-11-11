// Request validation middleware

const VALID_STATUSES = ['Pending', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'];

// Email validation helper
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// URL validation helper (allows http, https, or valid web urls/paths)
function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch (_) {
    // Also allow relative paths or standard web addresses
    return /^(https?:\/\/|\/|www\.)[^\s]+$/i.test(url.trim());
  }
}

// Validate Job payload
function validateJob(req, res, next) {
  const { job_title, company_name, description, skills, location, employment_type, salary } = req.body;
  const errors = [];

  if (!job_title || typeof job_title !== 'string' || !job_title.trim()) {
    errors.push('Job title is required.');
  } else if (job_title.trim().length > 255) {
    errors.push('Job title must not exceed 255 characters.');
  }

  if (!company_name || typeof company_name !== 'string' || !company_name.trim()) {
    errors.push('Company name is required.');
  } else if (company_name.trim().length > 255) {
    errors.push('Company name must not exceed 255 characters.');
  }

  if (location && location.length > 255) {
    errors.push('Location must not exceed 255 characters.');
  }

  if (employment_type && employment_type.length > 100) {
    errors.push('Employment type must not exceed 100 characters.');
  }

  if (salary && salary.length > 100) {
    errors.push('Salary must not exceed 100 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Clean data
  req.cleanedBody = {
    job_title: job_title.trim(),
    company_name: company_name.trim(),
    description: description ? description.trim() : null,
    skills: skills ? skills.trim() : null,
    location: location ? location.trim() : null,
    employment_type: employment_type ? employment_type.trim() : 'Full-time',
    salary: salary ? salary.trim() : null
  };

  next();
}

// Validate Application payload
function validateApplication(req, res, next) {
  const { job_id, applicant_name, applicant_email, resume_url, application_status } = req.body;
  const errors = [];

  const parsedJobId = parseInt(job_id, 10);
  if (!job_id || isNaN(parsedJobId) || parsedJobId <= 0) {
    errors.push('A valid Job ID is required.');
  }

  if (!applicant_name || typeof applicant_name !== 'string' || !applicant_name.trim()) {
    errors.push('Applicant name is required.');
  } else if (applicant_name.trim().length > 255) {
    errors.push('Applicant name must not exceed 255 characters.');
  }

  if (!applicant_email || typeof applicant_email !== 'string' || !applicant_email.trim()) {
    errors.push('Applicant email is required.');
  } else if (!isValidEmail(applicant_email.trim())) {
    errors.push('Please provide a valid email address.');
  } else if (applicant_email.trim().length > 255) {
    errors.push('Applicant email must not exceed 255 characters.');
  }

  if (resume_url && resume_url.trim().length > 500) {
    errors.push('Resume URL must not exceed 500 characters.');
  }

  if (application_status && !VALID_STATUSES.includes(application_status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  req.cleanedBody = {
    job_id: parsedJobId,
    applicant_name: applicant_name.trim(),
    applicant_email: applicant_email.trim().toLowerCase(),
    resume_url: resume_url ? resume_url.trim() : null,
    application_status: application_status || 'Pending'
  };

  next();
}

// Validate Application status update
function validateApplicationStatus(req, res, next) {
  const { application_status } = req.body;

  if (!application_status || !VALID_STATUSES.includes(application_status)) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: [`Valid application_status is required (${VALID_STATUSES.join(', ')})`]
    });
  }

  req.cleanedBody = {
    application_status
  };

  next();
}

module.exports = {
  validateJob,
  validateApplication,
  validateApplicationStatus,
  VALID_STATUSES
};
