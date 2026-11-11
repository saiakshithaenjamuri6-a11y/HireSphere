# HireSphere - Job and Application Management Platform

HireSphere is a modern, full-stack recruitment and talent acquisition management platform built with Node.js, Express, MySQL 8, and vanilla JavaScript. Designed with clean software architecture principles, HireSphere offers end-to-end management of job requisitions, candidate pipelines, and recruitment analytics through an intuitive, high-performance web interface.

---

## Key Features

### 1. Recruitment Analytics Dashboard
- **Real-Time KPIs**: Live tracking of published job openings, total candidate applications, pending reviews, and shortlisted candidates.
- **Visual Analytics**: Interactive recruitment pipeline breakdown and candidate distribution charts built using Chart.js.
- **Activity Streams**: Quick-access tables displaying recently posted job requisitions and incoming candidate applications.

### 2. Comprehensive Job Requisition Management
- **Full CRUD Capabilities**: Create, read, update, and delete job openings with instant UI synchronization.
- **Structured Role Data**: Track job title, hiring company, comprehensive descriptions, required skill sets, locations, employment types, and salary brackets.
- **Candidate Aggregation**: Inspect real-time applicant counts directly within the job listings.
- **Role Inspector Modal**: View full job details alongside a dedicated table of all candidates who have applied for the position.

### 3. End-to-End Application Tracking (ATS)
- **Multi-Stage Pipeline Management**: Move candidates through standardized hiring stages: `Pending`, `Reviewed`, `Shortlisted`, `Rejected`, and `Hired`.
- **Relational Integrity**: Direct foreign key linkage between candidate applications and specific job openings with cascading updates.
- **Resume & Portfolio Integration**: Quick-access direct links to candidate portfolios, GitHub profiles, or hosted resumes.
- **Inline Status Transitions**: Quickly advance candidates directly from the main applications table or from the candidate profile view.

### 4. Live Search and Multi-Dimensional Filtering
- **Full-Text Live Search**: Instant debounce search across job titles, hiring companies, candidate names, and email addresses.
- **Dynamic Filters**: Filter job requisitions by location and employment type; filter candidate applications by pipeline status and targeted role.
- **Filter Reset**: One-click state reset to return all filters to their default views.

### 5. System Health & Database Diagnostics
- **Live Connection Monitor**: Real-time ping diagnostics verifying active MySQL server connectivity.
- **Metadata Reporting**: Displays database engine version, database name, host, active port, and total record counts.
- **Server Telemetry**: Monitors Node.js runtime version, operating platform, process memory heap usage, and system uptime.

---

## Technology Stack

- **Frontend**: HTML5, CSS3 (Modern Flexbox & CSS Grid Design System), Vanilla JavaScript (ES6+ Modules, Fetch API).
- **Visualization**: Chart.js 4.4 (bundled locally for offline and air-gapped support).
- **Backend**: Node.js, Express.js.
- **Database**: MySQL 8.4 / 8.0 (InnoDB storage engine, UTF8MB4 charset).
- **Database Driver**: `mysql2` with asynchronous connection pooling and parameterized SQL queries.
- **API Style**: RESTful JSON endpoints with structured error handling.
- **Configuration**: `dotenv` for environment isolation.

---

## Project Structure

```
HireSphere/
├── client/                     # Frontend client assets
│   ├── css/
│   │   └── styles.css          # Design system, layout, components, and animations
│   ├── js/
│   │   ├── api.js              # REST client wrapper for API communication
│   │   ├── ui.js               # UI utilities, modal manager, and toast notifications
│   │   ├── dashboard.js        # Dashboard statistics, charts, and activity feeds
│   │   ├── jobs.js             # Job requisition CRUD, search, and filters
│   │   ├── applications.js     # Candidate application management and status updates
│   │   ├── settings.js         # Database diagnostics and runtime health
│   │   ├── chart.umd.min.js    # Bundled Chart.js library
│   │   └── app.js              # View router and application bootstrap
│   └── index.html              # Single Page Application (SPA) container
├── server/                     # Backend Express application
│   ├── config/
│   │   └── db.js               # MySQL2 connection pool and ping utility
│   ├── controllers/
│   │   ├── jobsController.js         # Jobs business logic and queries
│   │   ├── applicationsController.js # Applications business logic and queries
│   │   ├── dashboardController.js    # Aggregated metrics and chart data
│   │   └── settingsController.js     # Health checks and system specs
│   ├── middleware/
│   │   ├── errorHandler.js     # Centralized error handler and 404 handler
│   │   └── validator.js        # Input validation and sanitization
│   ├── routes/
│   │   ├── jobsRoutes.js             # /api/jobs routes
│   │   ├── applicationsRoutes.js     # /api/applications routes
│   │   ├── dashboardRoutes.js        # /api/dashboard routes
│   │   └── settingsRoutes.js         # /api/settings routes
│   ├── tests/
│   │   └── api.test.js         # Automated end-to-end API test suite
│   └── server.js               # Express application entrypoint
├── database/                   # Database schemas and seed scripts
│   ├── schema.sql              # Table definitions, foreign keys, and indexes
│   ├── seed.sql                # Realistic sample data for demonstration
│   └── init.js                 # Automated database initialization runner
├── screenshots/                # Visual verification screenshots
├── .env.example                # Sample environment configuration
├── .gitignore                  # Git ignore rules
├── package.json                # Project dependencies and npm scripts
└── README.md                   # Project documentation
```

---

## Database Architecture

HireSphere utilizes a relational MySQL schema optimized for data integrity and high-performance querying.

### Table: `jobs`
Stores job postings and requisition specifications.

| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | `INT` | Primary Key, Auto Increment | Unique job posting identifier |
| `job_title` | `VARCHAR(255)` | `NOT NULL` | Title of the position |
| `company_name` | `VARCHAR(255)` | `NOT NULL` | Hiring company or client organization |
| `description` | `TEXT` | `NULL` | Full job description and responsibilities |
| `skills` | `TEXT` | `NULL` | Comma-separated required skills and tags |
| `location` | `VARCHAR(255)` | `NULL` | Office location or remote status |
| `employment_type` | `VARCHAR(100)` | `DEFAULT 'Full-time'` | Full-time, Contract, Part-time, Remote |
| `salary` | `VARCHAR(100)` | `NULL` | Compensation range |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Requisition creation timestamp |

### Table: `applications`
Stores candidate applications linked to published job postings.

| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | `INT` | Primary Key, Auto Increment | Unique application identifier |
| `job_id` | `INT` | `NOT NULL`, Foreign Key | References `jobs(id)` |
| `applicant_name` | `VARCHAR(255)` | `NOT NULL` | Candidate's full name |
| `applicant_email` | `VARCHAR(255)` | `NOT NULL` | Candidate's verified email address |
| `resume_url` | `VARCHAR(500)` | `NULL` | URL to resume, portfolio, or profile |
| `application_status` | `VARCHAR(50)` | `DEFAULT 'Pending'` | Pending, Reviewed, Shortlisted, Rejected, Hired |
| `applied_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Submission timestamp |

### Relational Integrity
- **Foreign Key**: `fk_applications_job` links `applications.job_id` to `jobs.id`.
- **Cascading Rules**: Configured with `ON DELETE CASCADE` and `ON UPDATE CASCADE`. Deleting a job automatically cleans up all associated candidate submissions, maintaining referential integrity without orphan records.
- **Indexes**: Indexed columns include `jobs.location`, `jobs.employment_type`, `applications.job_id`, `applications.application_status`, and `applications.applicant_email`.

---

## Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) (v8.0 or v8.4)
- npm (Node Package Manager)

### 1. Clone & Navigate
```bash
git clone <repository-url>
cd HireSphere
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a local `.env` file from the provided `.env.example`:
```bash
cp .env.example .env
```

Configure your MySQL connection parameters in `.env`:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=jobs
```

### 4. Database Initialization & Seeding
Initialize the MySQL database and populate it with realistic demonstration data:
```bash
npm run db:init
```

This automated script will:
1. Connect to your MySQL server.
2. Create the `jobs` database if it does not already exist.
3. Execute `database/schema.sql` to establish tables, relationships, and indexes.
4. Execute `database/seed.sql` to load realistic sample jobs and applicant profiles.

---

## Running the Application

### Start Production Server
```bash
npm start
```

### Start Development Server (Watch Mode)
```bash
npm run dev
```

Once running, navigate to:
```
http://localhost:5000
```

---

## Running Automated Tests

HireSphere includes an automated API integration test suite covering CRUD operations, parameterized SQL queries, validations, and foreign key cascading.

Execute the test suite with:
```bash
npm run test:api
```

Expected output:
```
--- Starting HireSphere API Test Suite ---
  ✓ GET /api/dashboard/stats returns 200
  ✓ Response has success: true
  ✓ Total jobs is a number
  ✓ Total applications is a number
  ✓ GET /api/settings/status returns 200
  ✓ Database connected is true
  ✓ Database name is "jobs"
  ✓ GET /api/jobs returns 200
  ✓ Search by title works
  ✓ Filter by employment type works
  ✓ POST /api/jobs with missing title/company returns 400
  ✓ POST /api/jobs creates job (201)
  ✓ PUT /api/jobs/:id returns 200
  ✓ POST /api/applications with invalid email returns 400
  ✓ POST /api/applications creates application (201)
  ✓ PATCH /api/applications/:id/status returns 200
  ✓ PUT /api/applications/:id returns 200
  ✓ DELETE /api/jobs/:id returns 200
  ✓ Linked application was cascade-deleted (404)
========================================
Test Suite Finished: 24 Passed, 0 Failed
========================================
```

---

## RESTful API Reference

### Jobs API (`/api/jobs`)
| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `GET` | `/api/jobs` | Retrieve all job requisitions | `search`, `location`, `employment_type` |
| `GET` | `/api/jobs/:id` | Retrieve single job with applicants | None |
| `POST` | `/api/jobs` | Create a new job requisition | Body: `job_title`, `company_name`, etc. |
| `PUT` | `/api/jobs/:id` | Update an existing job requisition | Body: `job_title`, `company_name`, etc. |
| `DELETE` | `/api/jobs/:id` | Delete job (cascades to applications)| None |

### Applications API (`/api/applications`)
| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `GET` | `/api/applications` | Retrieve all candidate applications | `search`, `status`, `job_id` |
| `GET` | `/api/applications/:id` | Retrieve single application details | None |
| `POST` | `/api/applications` | Submit new candidate application | Body: `job_id`, `applicant_name`, `applicant_email`, etc. |
| `PUT` | `/api/applications/:id` | Update full application details | Body: `job_id`, `applicant_name`, etc. |
| `PATCH`| `/api/applications/:id/status`| Update application pipeline status | Body: `{ "application_status": "Shortlisted" }` |
| `DELETE`| `/api/applications/:id`| Remove candidate application | None |

### Dashboard & Analytics API (`/api/dashboard`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Aggregated KPI counts, status breakdown, top jobs by applications, and recent records |

### Settings & Diagnostics API (`/api/settings`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/settings/status` | Live database connection verification, server engine specs, record counts, and process memory/uptime |

---

## Visual Previews

Genuine interface screenshots are documented in the `screenshots/` directory:

| Screenshot | Description | File Path |
|---|---|---|
| **Dashboard** | KPI metric cards, pipeline status chart, and recent activity feeds | `screenshots/01_dashboard.png` |
| **Jobs Listing** | Tabular requisition management with dynamic filters and applicant count badges | `screenshots/02_jobs_listing.png` |
| **Add Job Form** | Modal interface for creating new job requisitions with input validation | `screenshots/03_add_job_form.png` |
| **Edit Job Form** | Pre-populated modal interface for modifying job details and specifications | `screenshots/04_edit_job_form.png` |
| **Applications Listing** | Candidate tracking table with direct resume links and status selectors | `screenshots/05_applications_listing.png` |
| **Application Details** | Detailed candidate profile view with applied role specs and portfolio access | `screenshots/06_application_details.png` |
| **Status Management** | Dynamic pipeline stage transitions (`Pending`, `Reviewed`, `Shortlisted`, `Hired`, `Rejected`) | `screenshots/07_application_status_management.png` |
| **Database Diagnostics** | Live MySQL 8 connection indicators, engine specs, and runtime telemetry | `screenshots/08_database_connection_status.png` |

---

## License

This software project is open source and available under the [MIT License](LICENSE).
