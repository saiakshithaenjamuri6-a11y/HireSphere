// HireSphere Jobs Management Module
// Handles Job CRUD, search, filter, and detail views

let jobsList = [];
let pendingDeleteJobId = null;

// Initialize Jobs Module
function initJobs() {
  const searchInput = document.getElementById('jobs-search-input');
  const locationFilter = document.getElementById('jobs-location-filter');
  const typeFilter = document.getElementById('jobs-type-filter');
  const resetBtn = document.getElementById('jobs-reset-filters');
  const addBtn = document.getElementById('jobs-btn-add');
  const emptyAddBtn = document.getElementById('jobs-empty-btn-add');
  const jobForm = document.getElementById('form-job');

  if (searchInput) {
    searchInput.addEventListener('input', UI.debounce(() => loadJobs(), 300));
  }

  if (locationFilter) {
    locationFilter.addEventListener('change', () => loadJobs());
  }

  if (typeFilter) {
    typeFilter.addEventListener('change', () => loadJobs());
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (locationFilter) locationFilter.value = 'all';
      if (typeFilter) typeFilter.value = 'all';
      loadJobs();
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => openJobFormModal());
  }
  if (emptyAddBtn) {
    emptyAddBtn.addEventListener('click', () => openJobFormModal());
  }

  if (jobForm) {
    jobForm.addEventListener('submit', handleJobFormSubmit);
  }

  // Linked Candidate button in Job View Modal
  const viewJobAddAppBtn = document.getElementById('view-job-btn-add-app');
  if (viewJobAddAppBtn) {
    viewJobAddAppBtn.addEventListener('click', () => {
      const currentJobId = viewJobAddAppBtn.getAttribute('data-job-id');
      UI.closeModal('modal-job-view');
      openApplicationFormModal(null, currentJobId);
    });
  }

  // Edit button inside View Modal
  const viewJobEditBtn = document.getElementById('view-job-btn-edit');
  if (viewJobEditBtn) {
    viewJobEditBtn.addEventListener('click', () => {
      const currentJobId = viewJobEditBtn.getAttribute('data-job-id');
      UI.closeModal('modal-job-view');
      openJobFormModal(currentJobId);
    });
  }
}

// Load and render jobs
async function loadJobs() {
  const search = document.getElementById('jobs-search-input')?.value.trim() || '';
  const location = document.getElementById('jobs-location-filter')?.value || 'all';
  const employment_type = document.getElementById('jobs-type-filter')?.value || 'all';

  try {
    const res = await api.getJobs({ search, location, employment_type });
    if (!res.success) throw new Error(res.message);

    jobsList = res.data;
    renderJobsTable(jobsList);
    updateLocationFilterOptions(jobsList);

    // Update table count badge
    const countBadge = document.getElementById('jobs-table-count');
    if (countBadge) countBadge.textContent = `${jobsList.length} postings`;

  } catch (error) {
    console.error('Error loading jobs:', error);
    UI.showToast('Failed to fetch job postings', 'error');
  }
}

// Render jobs to table
function renderJobsTable(jobs) {
  const tbody = document.getElementById('jobs-table-tbody');
  const emptyState = document.getElementById('jobs-empty-state');
  if (!tbody) return;

  if (!jobs || jobs.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = jobs.map(job => `
    <tr>
      <td>
        <div class="table-primary-text">${UI.escapeHtml(job.job_title)}</div>
        <div class="table-secondary-text">${UI.escapeHtml(job.company_name)}</div>
      </td>
      <td>
        <span style="display:inline-flex; align-items:center; gap:4px; color:var(--slate-600);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          ${UI.escapeHtml(job.location || 'Remote')}
        </span>
      </td>
      <td>
        <span class="skill-tag">${UI.escapeHtml(job.employment_type || 'Full-time')}</span>
      </td>
      <td style="font-weight:500; color:var(--navy-900);">${UI.escapeHtml(job.salary || 'Competitive')}</td>
      <td>
        <button class="btn btn-subtle btn-sm" onclick="viewJobDetails(${job.id})" style="padding:2px 8px; font-weight:600;">
          ${job.applications_count} candidate${job.applications_count === 1 ? '' : 's'}
        </button>
      </td>
      <td class="table-secondary-text">${UI.formatDate(job.created_at)}</td>
      <td style="text-align: right;">
        <div class="cell-actions" style="justify-content: flex-end;">
          <button class="btn-icon" onclick="viewJobDetails(${job.id})" title="View Details" aria-label="View Details">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          <button class="btn-icon" onclick="openJobFormModal(${job.id})" title="Edit Job" aria-label="Edit Job">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn-icon danger" onclick="confirmDeleteJob(${job.id}, '${UI.escapeHtml(job.job_title)}')" title="Delete Job" aria-label="Delete Job">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Populate location filter dropdown dynamically
function updateLocationFilterOptions(jobs) {
  const select = document.getElementById('jobs-location-filter');
  if (!select) return;

  const currentVal = select.value;
  const locations = new Set();
  jobs.forEach(j => {
    if (j.location && j.location.trim()) {
      locations.add(j.location.trim());
    }
  });

  const sortedLocations = Array.from(locations).sort();
  select.innerHTML = '<option value="all">All Locations</option>' +
    sortedLocations.map(loc => `<option value="${UI.escapeHtml(loc)}" ${currentVal === loc ? 'selected' : ''}>${UI.escapeHtml(loc)}</option>`).join('');
}

// Open Job Add/Edit Modal
async function openJobFormModal(jobId = null) {
  const modal = document.getElementById('modal-job-form');
  const title = document.getElementById('modal-job-title');
  const idInput = document.getElementById('job-form-id');
  const titleInput = document.getElementById('job-input-title');
  const companyInput = document.getElementById('job-input-company');
  const locationInput = document.getElementById('job-input-location');
  const typeInput = document.getElementById('job-input-type');
  const salaryInput = document.getElementById('job-input-salary');
  const skillsInput = document.getElementById('job-input-skills');
  const descInput = document.getElementById('job-input-desc');

  if (jobId) {
    title.textContent = 'Edit Job Posting';
    try {
      const res = await api.getJob(jobId);
      const job = res.data;
      idInput.value = job.id;
      titleInput.value = job.job_title || '';
      companyInput.value = job.company_name || '';
      locationInput.value = job.location || '';
      typeInput.value = job.employment_type || 'Full-time';
      salaryInput.value = job.salary || '';
      skillsInput.value = job.skills || '';
      descInput.value = job.description || '';
    } catch (err) {
      UI.showToast('Could not load job details for editing', 'error');
      return;
    }
  } else {
    title.textContent = 'Post New Job';
    idInput.value = '';
    titleInput.value = '';
    companyInput.value = '';
    locationInput.value = '';
    typeInput.value = 'Full-time';
    salaryInput.value = '';
    skillsInput.value = '';
    descInput.value = '';
  }

  UI.openModal('modal-job-form');
}

// Handle Job Form Submit
async function handleJobFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('job-form-id').value;
  const job_title = document.getElementById('job-input-title').value.trim();
  const company_name = document.getElementById('job-input-company').value.trim();
  const location = document.getElementById('job-input-location').value.trim();
  const employment_type = document.getElementById('job-input-type').value;
  const salary = document.getElementById('job-input-salary').value.trim();
  const skills = document.getElementById('job-input-skills').value.trim();
  const description = document.getElementById('job-input-desc').value.trim();

  if (!job_title || !company_name) {
    UI.showToast('Job title and company name are required.', 'error');
    return;
  }

  const payload = {
    job_title,
    company_name,
    location,
    employment_type,
    salary,
    skills,
    description
  };

  const submitBtn = document.getElementById('btn-job-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    if (id) {
      await api.updateJob(id, payload);
      UI.showToast('Job posting updated successfully', 'success');
    } else {
      await api.createJob(payload);
      UI.showToast('Job posting created successfully', 'success');
    }

    UI.closeModal('modal-job-form');
    loadJobs();
    if (window.loadDashboard) window.loadDashboard();
    if (window.refreshJobSelectDropdowns) window.refreshJobSelectDropdowns();

  } catch (err) {
    UI.showToast(err.message || 'Failed to save job posting', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Job Posting';
  }
}

// View Job Details Modal
async function viewJobDetails(jobId) {
  try {
    const res = await api.getJob(jobId);
    if (!res.success) throw new Error(res.message);

    const job = res.data;

    document.getElementById('view-job-title').textContent = job.job_title;
    document.getElementById('view-job-company').textContent = job.company_name;
    document.getElementById('view-job-location').textContent = job.location || 'Remote';
    document.getElementById('view-job-type').textContent = job.employment_type || 'Full-time';
    document.getElementById('view-job-salary').textContent = job.salary || 'Competitive';
    document.getElementById('view-job-date').textContent = UI.formatDate(job.created_at);
    document.getElementById('view-job-desc').textContent = job.description || 'No description provided.';

    // Render skills tags
    const skillsContainer = document.getElementById('view-job-skills');
    if (job.skills && job.skills.trim()) {
      const skillsArray = job.skills.split(',').map(s => s.trim()).filter(Boolean);
      skillsContainer.innerHTML = skillsArray.map(s => `<span class="skill-tag">${UI.escapeHtml(s)}</span>`).join('');
    } else {
      skillsContainer.innerHTML = '<span style="color:var(--slate-400); font-size:12px;">No skills specified</span>';
    }

    // Set dataset for Edit & Add App buttons
    document.getElementById('view-job-btn-edit').setAttribute('data-job-id', job.id);
    document.getElementById('view-job-btn-add-app').setAttribute('data-job-id', job.id);

    // Linked Applications list
    const appsCount = job.applications ? job.applications.length : 0;
    document.getElementById('view-job-app-count').textContent = appsCount;

    const appsTbody = document.getElementById('view-job-apps-tbody');
    if (appsCount === 0) {
      appsTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:16px; color:var(--slate-400);">No candidate applications yet for this role.</td></tr>`;
    } else {
      appsTbody.innerHTML = job.applications.map(a => `
        <tr>
          <td>
            <div style="font-weight:600; color:var(--navy-900); font-size:12px;">${UI.escapeHtml(a.applicant_name)}</div>
            <div style="font-size:11px; color:var(--slate-500);">${UI.escapeHtml(a.applicant_email)}</div>
          </td>
          <td>${UI.getStatusBadgeHtml(a.application_status)}</td>
          <td style="font-size:12px; color:var(--slate-500);">${UI.formatDate(a.applied_at)}</td>
          <td>
            <button class="btn btn-subtle btn-sm" onclick="UI.closeModal('modal-job-view'); viewApplicationDetails(${a.id})">Details</button>
          </td>
        </tr>
      `).join('');
    }

    UI.openModal('modal-job-view');

  } catch (error) {
    console.error('Error viewing job:', error);
    UI.showToast('Failed to load job details', 'error');
  }
}

// Confirm Delete Job Modal
function confirmDeleteJob(jobId, jobTitle) {
  pendingDeleteJobId = jobId;
  document.getElementById('delete-modal-title').textContent = 'Delete Job Posting';
  document.getElementById('delete-modal-message').innerHTML = `Are you sure you want to delete <strong>${UI.escapeHtml(jobTitle)}</strong>?`;
  document.getElementById('delete-modal-warning').style.display = 'block';

  const confirmBtn = document.getElementById('delete-modal-confirm-btn');
  confirmBtn.onclick = async () => {
    try {
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Deleting...';

      await api.deleteJob(pendingDeleteJobId);
      UI.showToast(`Job posting and associated applications removed`, 'success');
      UI.closeModal('modal-confirm-delete');

      loadJobs();
      if (window.loadApplications) window.loadApplications();
      if (window.loadDashboard) window.loadDashboard();
      if (window.refreshJobSelectDropdowns) window.refreshJobSelectDropdowns();

    } catch (err) {
      UI.showToast(err.message || 'Failed to delete job', 'error');
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Confirm Delete';
      pendingDeleteJobId = null;
    }
  };

  UI.openModal('modal-confirm-delete');
}

window.initJobs = initJobs;
window.loadJobs = loadJobs;
window.viewJobDetails = viewJobDetails;
window.openJobFormModal = openJobFormModal;
window.confirmDeleteJob = confirmDeleteJob;
