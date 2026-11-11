// HireSphere Automated API Test Suite
const http = require('http');
const { app } = require('../server');
const { pool } = require('../config/db');

let server;
let port = 5005;
const BASE_URL = `http://localhost:${port}`;

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n--- Starting HireSphere API Test Suite ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  server = app.listen(port);
  await new Promise(r => setTimeout(r, 400));

  try {
    // 1. Dashboard Stats
    console.log('\n1. Testing Dashboard Stats:');
    const statsRes = await makeRequest('GET', '/api/dashboard/stats');
    assert(statsRes.status === 200, 'GET /api/dashboard/stats returns 200');
    assert(statsRes.body.success === true, 'Response has success: true');
    assert(typeof statsRes.body.data.summary.total_jobs === 'number', 'Total jobs is a number');
    assert(typeof statsRes.body.data.summary.total_applications === 'number', 'Total applications is a number');

    // 2. Settings Status
    console.log('\n2. Testing Settings Status:');
    const settingsRes = await makeRequest('GET', '/api/settings/status');
    assert(settingsRes.status === 200, 'GET /api/settings/status returns 200');
    assert(settingsRes.body.data.database.connected === true, 'Database connected is true');
    assert(settingsRes.body.data.database.database_name === 'jobs', 'Database name is "jobs"');

    // 3. Jobs Listing & Search & Filters
    console.log('\n3. Testing Jobs Listing & Search:');
    const jobsRes = await makeRequest('GET', '/api/jobs');
    assert(jobsRes.status === 200, 'GET /api/jobs returns 200');
    assert(Array.isArray(jobsRes.body.data), 'Jobs data is an array');

    const searchRes = await makeRequest('GET', '/api/jobs?search=Full-Stack');
    assert(searchRes.status === 200 && searchRes.body.data.length > 0, 'Search by title works');

    const filterRes = await makeRequest('GET', '/api/jobs?employment_type=Full-time');
    assert(filterRes.status === 200, 'Filter by employment type works');

    // 4. Job Creation & Validation
    console.log('\n4. Testing Job Creation & Validation:');
    const invalidJob = await makeRequest('POST', '/api/jobs', {
      job_title: '',
      company_name: ''
    });
    assert(invalidJob.status === 400, 'POST /api/jobs with missing title/company returns 400');

    const newJobRes = await makeRequest('POST', '/api/jobs', {
      job_title: 'Test Software Architect',
      company_name: 'Test Labs Inc.',
      description: 'Architecting cutting-edge cloud native microservices.',
      skills: 'Node.js, MySQL, Cloud Architecture',
      location: 'Remote',
      employment_type: 'Full-time',
      salary: '$150,000 - $180,000'
    });
    assert(newJobRes.status === 201, 'POST /api/jobs creates job (201)');
    const createdJobId = newJobRes.body.data.id;
    assert(typeof createdJobId === 'number', `Created job ID: ${createdJobId}`);

    // 5. Job Update
    console.log('\n5. Testing Job Update:');
    const updateJobRes = await makeRequest('PUT', `/api/jobs/${createdJobId}`, {
      job_title: 'Lead Software Architect (Updated)',
      company_name: 'Test Labs Inc.',
      description: 'Updated architecture description.',
      skills: 'Node.js, MySQL, AWS, Docker',
      location: 'Austin, TX',
      employment_type: 'Full-time',
      salary: '$160,000 - $190,000'
    });
    assert(updateJobRes.status === 200, 'PUT /api/jobs/:id returns 200');
    assert(updateJobRes.body.data.job_title === 'Lead Software Architect (Updated)', 'Job title updated');

    // 6. Application Creation & Validation
    console.log('\n6. Testing Application Creation & Validation:');
    const invalidApp = await makeRequest('POST', '/api/applications', {
      job_id: createdJobId,
      applicant_name: 'Test Applicant',
      applicant_email: 'invalid-email-format'
    });
    assert(invalidApp.status === 400, 'POST /api/applications with invalid email returns 400');

    const validApp = await makeRequest('POST', '/api/applications', {
      job_id: createdJobId,
      applicant_name: 'Samantha Ray',
      applicant_email: 'samantha.ray@test.com',
      resume_url: 'https://resume.samantharany.io',
      application_status: 'Pending'
    });
    assert(validApp.status === 201, 'POST /api/applications creates application (201)');
    const createdAppId = validApp.body.data.id;

    // 7. Application Status Patch
    console.log('\n7. Testing Application Status Update:');
    const statusPatchRes = await makeRequest('PATCH', `/api/applications/${createdAppId}/status`, {
      application_status: 'Shortlisted'
    });
    assert(statusPatchRes.status === 200, 'PATCH /api/applications/:id/status returns 200');
    assert(statusPatchRes.body.data.application_status === 'Shortlisted', 'Status changed to Shortlisted');

    // 8. Application Full Update
    console.log('\n8. Testing Application Full Update:');
    const fullAppUpdate = await makeRequest('PUT', `/api/applications/${createdAppId}`, {
      job_id: createdJobId,
      applicant_name: 'Samantha Ray Senior',
      applicant_email: 'samantha.updated@test.com',
      resume_url: 'https://updated-resume.com',
      application_status: 'Reviewed'
    });
    assert(fullAppUpdate.status === 200, 'PUT /api/applications/:id returns 200');
    assert(fullAppUpdate.body.data.applicant_name === 'Samantha Ray Senior', 'Applicant name updated');

    // 9. Cascade Delete Test
    console.log('\n9. Testing Foreign Key Cascade Delete:');
    const deleteJobRes = await makeRequest('DELETE', `/api/jobs/${createdJobId}`);
    assert(deleteJobRes.status === 200, 'DELETE /api/jobs/:id returns 200');

    // Verify application was automatically deleted by cascade
    const verifyAppDeleted = await makeRequest('GET', `/api/applications/${createdAppId}`);
    assert(verifyAppDeleted.status === 404, 'Linked application was cascade-deleted (404)');

    console.log(`\n========================================`);
    console.log(`Test Suite Finished: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    await pool.end();
  }
}

runTests();
