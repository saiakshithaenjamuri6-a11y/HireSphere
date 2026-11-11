-- HireSphere Sample Seed Data
-- Realistic jobs and applications for demonstration

USE jobs;

-- Clear any existing records
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE applications;
TRUNCATE TABLE jobs;
SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------------
-- Seed Jobs
-- -------------------------------------------------------------
INSERT INTO jobs (id, job_title, company_name, description, skills, location, employment_type, salary, created_at)
VALUES
(
    1,
    'Senior Full-Stack Engineer',
    'Nexus Cloud Technologies',
    'We are looking for an experienced Senior Full-Stack Engineer to lead the architectural evolution of our distributed SaaS platforms. You will collaborate closely with product management and platform architects to build high-throughput microservices, design scalable RESTful APIs, and deliver intuitive frontend applications.',
    'Node.js, TypeScript, React, MySQL, Redis, Docker, AWS',
    'San Francisco, CA (Remote)',
    'Full-time',
    '$145,000 - $175,000',
    DATE_SUB(NOW(), INTERVAL 14 DAY)
),
(
    2,
    'Lead UI/UX Product Designer',
    'Aura Design Systems',
    'Join our product design team to shape modern web applications from ideation to production. You will be responsible for creating user journey maps, high-fidelity wireframes, comprehensive design systems, and conducting customer usability testing sessions.',
    'Figma, Design Systems, Prototyping, User Research, HTML/CSS',
    'New York, NY',
    'Full-time',
    '$125,000 - $150,000',
    DATE_SUB(NOW(), INTERVAL 11 DAY)
),
(
    3,
    'DevOps & Infrastructure Engineer',
    'Vanguard Systems',
    'Vanguard Systems is seeking a dedicated DevOps specialist to maintain our Kubernetes clusters, optimize CI/CD deployment pipelines, and strengthen security protocols across multi-region cloud infrastructures.',
    'Kubernetes, Terraform, AWS, Docker, GitHub Actions, Linux',
    'Austin, TX (Hybrid)',
    'Full-time',
    '$135,000 - $160,000',
    DATE_SUB(NOW(), INTERVAL 9 DAY)
),
(
    4,
    'Backend Systems Developer',
    'FinTech Core Labs',
    'Seeking a detail-oriented backend engineer to build mission-critical financial ledger services, handle transactional integrity, implement high-performance caching layers, and integrate secure third-party payment gateways.',
    'Node.js, Express, MySQL, PostgreSQL, REST APIs, Microservices',
    'Chicago, IL',
    'Full-time',
    '$120,000 - $140,000',
    DATE_SUB(NOW(), INTERVAL 7 DAY)
),
(
    5,
    'Frontend Application Engineer',
    'Pulse Interactive',
    'Pulse Interactive develops rich analytics dashboards for enterprise commerce clients. In this role, you will build responsive, accessible, and ultra-fast client-side interfaces using modern JavaScript, CSS architectures, and data visualization libraries.',
    'JavaScript, CSS3, Chart.js, HTML5, REST API Integration, Git',
    'Seattle, WA (Remote)',
    'Contract',
    '$65 - $80 / hour',
    DATE_SUB(NOW(), INTERVAL 5 DAY)
),
(
    6,
    'Technical Product Manager',
    'Synthetix Data Platforms',
    'We are hiring an analytical Technical Product Manager to oversee the lifecycle of our enterprise data integration solutions. You will translate customer feedback into technical roadmaps and prioritize engineering backlogs.',
    'Agile/Scrum, Product Strategy, API Architecture, SQL, JIRA',
    'Boston, MA (Hybrid)',
    'Full-time',
    '$130,000 - $155,000',
    DATE_SUB(NOW(), INTERVAL 3 DAY)
),
(
    7,
    'Data Platform Specialist',
    'Stratum Analytics',
    'Build and maintain reliable ETL data pipelines, configure data warehousing solutions, and empower business intelligence teams with clean, timely datasets.',
    'Python, SQL, Snowflake, Airflow, dbt, Spark',
    'Denver, CO (Remote)',
    'Full-time',
    '$115,000 - $138,000',
    DATE_SUB(NOW(), INTERVAL 2 DAY)
),
(
    8,
    'Site Reliability Engineer',
    'Crestline Security',
    'Ensure 99.99% uptime for our cybersecurity monitoring platforms through proactive observability, automated failover routines, and incident management.',
    'Prometheus, Grafana, Python, Bash, AWS, Kubernetes',
    'San Jose, CA',
    'Full-time',
    '$140,000 - $165,000',
    DATE_SUB(NOW(), INTERVAL 1 DAY)
);

-- -------------------------------------------------------------
-- Seed Applications
-- -------------------------------------------------------------
INSERT INTO applications (id, job_id, applicant_name, applicant_email, resume_url, application_status, applied_at)
VALUES
(
    1,
    1,
    'Alexander Hayes',
    'alexander.hayes@example.com',
    'https://portfolio.hayes-dev.io/resume.pdf',
    'Shortlisted',
    DATE_SUB(NOW(), INTERVAL 12 DAY)
),
(
    2,
    1,
    'Elena Rostova',
    'elena.rostova@techmail.org',
    'https://drive.google.com/file/d/elena-rostova-cv',
    'Reviewed',
    DATE_SUB(NOW(), INTERVAL 10 DAY)
),
(
    3,
    1,
    'Marcus Chen',
    'marcus.chen@innovate.dev',
    'https://marcuschen.me/alex_resume.pdf',
    'Hired',
    DATE_SUB(NOW(), INTERVAL 8 DAY)
),
(
    4,
    2,
    'Sophia Martinez',
    'sophia.m.designs@creatives.com',
    'https://sophiamartinez.design/resume',
    'Shortlisted',
    DATE_SUB(NOW(), INTERVAL 9 DAY)
),
(
    5,
    2,
    'Lucas Vance',
    'lucas.vance@visualwork.net',
    'https://lucasvance.net/cv-2026.pdf',
    'Pending',
    DATE_SUB(NOW(), INTERVAL 7 DAY)
),
(
    6,
    3,
    'David Kim',
    'david.kim@cloudinfra.pro',
    'https://github.com/dkim-infra/resume',
    'Reviewed',
    DATE_SUB(NOW(), INTERVAL 6 DAY)
),
(
    7,
    3,
    'Rachel Green',
    'rachel.green@sysops.io',
    'https://storage.cloudresume.com/rachel_green_sre.pdf',
    'Rejected',
    DATE_SUB(NOW(), INTERVAL 5 DAY)
),
(
    8,
    4,
    'Julian Becker',
    'julian.becker@beckerfintech.de',
    'https://becker-engineering.com/docs/resume.pdf',
    'Shortlisted',
    DATE_SUB(NOW(), INTERVAL 5 DAY)
),
(
    9,
    4,
    'Priya Sharma',
    'priya.sharma@enterprise-dev.com',
    'https://priyasharma.io/documents/resume.pdf',
    'Pending',
    DATE_SUB(NOW(), INTERVAL 4 DAY)
),
(
    10,
    5,
    'Liam O''Connor',
    'liam.oconnor@frontcraft.ie',
    'https://liamoconnor.webflow.io/cv',
    'Pending',
    DATE_SUB(NOW(), INTERVAL 3 DAY)
),
(
    11,
    5,
    'Chloe Dubois',
    'chloe.dubois@frontendlabs.fr',
    'https://chloedubois.dev/resume.pdf',
    'Reviewed',
    DATE_SUB(NOW(), INTERVAL 2 DAY)
),
(
    12,
    6,
    'Nathaniel Ward',
    'nathaniel.ward@productleaders.co',
    'https://nathanielward.com/resume.pdf',
    'Pending',
    DATE_SUB(NOW(), INTERVAL 2 DAY)
),
(
    13,
    7,
    'Maya Patel',
    'maya.patel@datasciencehub.org',
    'https://mayapatel.cloud/cv.pdf',
    'Shortlisted',
    DATE_SUB(NOW(), INTERVAL 1 DAY)
),
(
    14,
    8,
    'Ethan Wright',
    'ethan.wright@sreops.net',
    'https://ethanwright.dev/resume',
    'Pending',
    NOW()
);
