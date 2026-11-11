-- HireSphere Database Schema
-- Database: jobs
-- Engine: InnoDB

CREATE DATABASE IF NOT EXISTS jobs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jobs;

-- Drop dependent tables first
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS jobs;

-- -------------------------------------------------------------
-- Table: jobs
-- -------------------------------------------------------------
CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    description TEXT,
    skills TEXT,
    location VARCHAR(255),
    employment_type VARCHAR(100),
    salary VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Table: applications
-- -------------------------------------------------------------
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    resume_url VARCHAR(500),
    application_status VARCHAR(50) DEFAULT 'Pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_applications_job
        FOREIGN KEY (job_id)
        REFERENCES jobs (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Useful indexes for fast searching and filtering
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(application_status);
CREATE INDEX idx_applications_email ON applications(applicant_email);
