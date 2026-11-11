// HireSphere Application Management Module
// Handles Candidate Application CRUD, search, status filtering, and pipeline transitions

let applicationsList = [];
let pendingDeleteAppId = null;
let currentViewingAppId = null;

// Initialize Applications Module
function initApplications() {
  const searchInput = document.getElementById('apps-search-input');
  const statusFilter = document.getElementById('apps-status-filter');
  const jobFilter = document.getElementById('apps-job-filter');
  const resetBtn = document.getElementById('apps-reset-filters');
  const addBtn = document.getElementById('apps-btn-add');
  const emptyAddBtn = document.getElementById('apps-empty-btn-add');
  const appForm = document.getElementById('form-application');

  if (searchInput) {
    searchInput.addEventListener('input', UI.debounce(() => loadApplications(), 300));
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', () => loadApplications());
  }

  if (jobFilter) {
    jobFilter.addEventListener('change', () => loadApplications());
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (statusFilter) statusFilter.value = 'all';
      if (jobFilter) jobFilter.value = 'all';
      loadApplications();
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => openApplicationFormModal());
  }
  if (emptyAddBtn) {
    emptyAddBtn.addEventListener('click', () => openApplicationFormModal());
  }

  if (appForm) {
    appForm.addEventListener('submit', handleApplicationFormSubmit);
  }

  // Quick status update button in View Details Modal
  const updateStatusBtn = document.getElementById('view-app-btn-update-status');
  if (updateStatusBtn) {
    updateStatusBtn.addEventListener('click', handleQuickStatusUpdate);
  }

  // Edit button in View Details Modal
  const editAppBtn = document.getElementById('view-app-btn-edit');
  if (editAppBtn) {
    editAppBtn.addEventListener('click', () => {
      const appId = currentViewingAppId;
      UI.closeModal('modal-app-view');
      openApplicationFormModal(appId);
    });
  }
}

// Refresh job dropdown options across application filters and form
async function refreshJobSelectDropdowns() {
  try {
    const res = await api.getJobs();
    if (!res.success) return;
    const jobs = res.data;

    // Filter dropdown on Applications page
    const filterSelect = document.getElementById('apps-job-filter');
    if (filterSelect) {
      const curVal = filterSelect.value;
      filterSelect.innerHTML = '<option value="all">All Jobs</option>' +
        jobs.map(j => `<option value="${j.id}" ${curVal == j.id ? 'selected' : ''}>${UI.escapeHtml(j.job_title)} (${UI.escapeHtml(j.company_name)})</option>`).join('');
    }

    // Modal job select dropdown
    const formJobSelect = document.getElementById('app-input-job');
    if (formJobSelect) {
      const curVal = formJobSelect.value;
      formJobSelect.innerHTML = '<option value="">Select a job posting...</option>' +
        jobs.map(j => `<option value="${j.id}" ${curVal == j.id ? 'selected' : ''}>${UI.escapeHtml(j.job_title)} — ${UI.escapeHtml(j.company_name)}</option>`).join('');
    }
  } catch (e) {
    console.error('Failed to populate jobs select:', e);
  }
}

// Load and render applications
async function loadApplications() {
  const search = document.getElementById('apps-search-input')?.value.trim() || '';
  const status = document.getElementById('apps-status-filter')?.value || 'all';
  const job_id = document.getElementById('apps-job-filter')?.value || 'all';

  try {
    const res = await api.getApplications({ search, status, job_id });
    if (!res.success) throw new Error(res.message);

    applicationsList = res.data;
    renderApplicationsTable(applicationsList);

    const countBadge = document.getElementById('apps-table-count');
    if (countBadge) countBadge.textContent = `${applicationsList.length} applications`;

  } catch (error) {
    console.error('Error loading applications:', error);
    UI.showToast('Failed to fetch candidate applications', 'error');
  }
}

// Render applications to table
function renderApplicationsTable(apps) {
  const tbody = document.getElementById('apps-table-tbody');
  const emptyState = document.getElementById('apps-empty-state');
  if (!tbody) return;

  if (!apps || apps.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = apps.map(app => `
    <tr>
      <td>
        <div class="table-primary-text">${UI.escapeHtml(app.applicant_name)}</div>
        <div class="table-secondary-text">
          <a href="mailto:${UI.escapeHtml(app.applicant_email)}" style="color:var(--slate-500); text-decoration:none;">${UI.escapeHtml(app.applicant_email)}</a>
        </div>
      </td>
      <td>
        <div class="table-primary-text" style="font-size:13px;">${UI.escapeHtml(app.job_title)}</div>
        <div class="table-secondary-text">${UI.escapeHtml(app.company_name)}</div>
      </td>
      <td>
        ${app.resume_url ? `
          <a href="${UI.escapeHtml(app.resume_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-subtle btn-sm" style="display:inline-flex; align-items:center; gap:4px; font-size:11px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            Resume
          </a>
        ` : `<span style="color:var(--slate-400); font-size:12px;">None</span>`}
      </td>
      <td>
        <select class="filter-select" style="padding:4px 26px 4px 8px; font-size:11px; font-weight:600; border-radius:12px; height:auto; background-position: right 6px center;" onchange="handleInlineStatusChange(${app.id}, this.value)">
          <option value="Pending" ${app.application_status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Reviewed" ${app.application_status === 'Reviewed' ? 'selected' : ''}>Reviewed</option>
          <option value="Shortlisted" ${app.application_status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
          <option value="Hired" ${app.application_status === 'Hired' ? 'selected' : ''}>Hired</option>
          <option value="Rejected" ${app.application_status === 'Rejected' ? 'selected' : ''}>Rejected</option>
        </select>
      </td>
      <td class="table-secondary-text">${UI.formatDate(app.applied_at)}</td>
      <td style="text-align: right;">
        <div class="cell-actions" style="justify-content: flex-end;">
          <button class="btn-icon" onclick="viewApplicationDetails(${app.id})" title="View Details" aria-label="View Details">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          <button class="btn-icon" onclick="openApplicationFormModal(${app.id})" title="Edit Application" aria-label="Edit Application">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn-icon danger" onclick="confirmDeleteApplication(${app.id}, '${UI.escapeHtml(app.applicant_name)}')" title="Delete Application" aria-label="Delete Application">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Inline status update from table dropdown
async function handleInlineStatusChange(appId, newStatus) {
  try {
    await api.updateApplicationStatus(appId, newStatus);
    UI.showToast(`Status updated to "${newStatus}"`, 'success');
    if (window.loadDashboard) window.loadDashboard();
  } catch (err) {
    UI.showToast(err.message || 'Failed to update status', 'error');
    loadApplications();
  }
}

// Open Application Add/Edit Modal
async function openApplicationFormModal(appId = null, preselectedJobId = null) {
  await refreshJobSelectDropdowns();

  const title = document.getElementById('modal-app-title');
  const idInput = document.getElementById('app-form-id');
  const jobSelect = document.getElementById('app-input-job');
  const nameInput = document.getElementById('app-input-name');
  const emailInput = document.getElementById('app-input-email');
  const resumeInput = document.getElementById('app-input-resume');
  const statusSelect = document.getElementById('app-input-status');

  if (appId) {
    title.textContent = 'Edit Application';
    try {
      const res = await api.getApplication(appId);
      const app = res.data;
      idInput.value = app.id;
      jobSelect.value = app.job_id;
      nameInput.value = app.applicant_name;
      emailInput.value = app.applicant_email;
      resumeInput.value = app.resume_url || '';
      statusSelect.value = app.application_status;
    } catch (err) {
      UI.showToast('Could not load application details', 'error');
      return;
    }
  } else {
    title.textContent = 'New Candidate Application';
    idInput.value = '';
    jobSelect.value = preselectedJobId || '';
    nameInput.value = '';
    emailInput.value = '';
    resumeInput.value = '';
    statusSelect.value = 'Pending';
  }

  UI.openModal('modal-app-form');
}

// Handle Application Form Submit
async function handleApplicationFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('app-form-id').value;
  const job_id = document.getElementById('app-input-job').value;
  const applicant_name = document.getElementById('app-input-name').value.trim();
  const applicant_email = document.getElementById('app-input-email').value.trim();
  const resume_url = document.getElementById('app-input-resume').value.trim();
  const application_status = document.getElementById('app-input-status').value;

  if (!job_id) {
    UI.showToast('Please select a target job posting.', 'error');
    return;
  }

  if (!applicant_name) {
    UI.showToast('Candidate name is required.', 'error');
    return;
  }

  if (!applicant_email) {
    UI.showToast('Candidate email is required.', 'error');
    return;
  }

  const payload = {
    job_id: parseInt(job_id, 10),
    applicant_name,
    applicant_email,
    resume_url: resume_url || null,
    application_status
  };

  const submitBtn = document.getElementById('btn-app-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    if (id) {
      await api.updateApplication(id, payload);
      UI.showToast('Application updated successfully', 'success');
    } else {
      await api.createApplication(payload);
      UI.showToast('Candidate application submitted successfully', 'success');
    }

    UI.closeModal('modal-app-form');
    loadApplications();
    if (window.loadJobs) window.loadJobs();
    if (window.loadDashboard) window.loadDashboard();

  } catch (err) {
    UI.showToast(err.message || 'Failed to submit application', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Application';
  }
}

// View Application Details Modal
async function viewApplicationDetails(appId) {
  currentViewingAppId = appId;
  try {
    const res = await api.getApplication(appId);
    if (!res.success) throw new Error(res.message);

    const app = res.data;

    document.getElementById('view-app-name').textContent = app.applicant_name;
    document.getElementById('view-app-email').textContent = app.applicant_email;
    document.getElementById('view-app-date').textContent = UI.formatDate(app.applied_at);
    document.getElementById('view-app-status-badge').innerHTML = UI.getStatusBadgeHtml(app.application_status);
    document.getElementById('view-app-job-title').textContent = app.job_title;
    document.getElementById('view-app-company').textContent = `${app.company_name} • ${app.job_location || 'Remote'}`;
    document.getElementById('view-app-status-select').value = app.application_status;

    const resumeContainer = document.getElementById('view-app-resume-container');
    if (app.resume_url) {
      resumeContainer.innerHTML = `
        <a href="${UI.escapeHtml(app.resume_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="display:inline-flex; align-items:center; gap:6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          Open Resume / Portfolio Link &nearr;
        </a>
      `;
    } else {
      resumeContainer.innerHTML = `<span style="font-size:13px; color:var(--slate-400);">No resume link provided</span>`;
    }

    UI.openModal('modal-app-view');

  } catch (error) {
    console.error('Error viewing application:', error);
    UI.showToast('Failed to load application details', 'error');
  }
}

// Handle Quick Status Update inside View Modal
async function handleQuickStatusUpdate() {
  if (!currentViewingAppId) return;
  const newStatus = document.getElementById('view-app-status-select').value;
  const btn = document.getElementById('view-app-btn-update-status');

  btn.disabled = true;
  btn.textContent = 'Updating...';

  try {
    await api.updateApplicationStatus(currentViewingAppId, newStatus);
    document.getElementById('view-app-status-badge').innerHTML = UI.getStatusBadgeHtml(newStatus);
    UI.showToast(`Status updated to "${newStatus}"`, 'success');

    loadApplications();
    if (window.loadDashboard) window.loadDashboard();

  } catch (err) {
    UI.showToast(err.message || 'Failed to update status', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Update Status';
  }
}

// Confirm Delete Application Modal
function confirmDeleteApplication(appId, applicantName) {
  pendingDeleteAppId = appId;
  document.getElementById('delete-modal-title').textContent = 'Delete Candidate Application';
  document.getElementById('delete-modal-message').innerHTML = `Are you sure you want to remove the application for <strong>${UI.escapeHtml(applicantName)}</strong>?`;
  document.getElementById('delete-modal-warning').style.display = 'none';

  const confirmBtn = document.getElementById('delete-modal-confirm-btn');
  confirmBtn.onclick = async () => {
    try {
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Deleting...';

      await api.deleteApplication(pendingDeleteAppId);
      UI.showToast('Application deleted successfully', 'success');
      UI.closeModal('modal-confirm-delete');

      loadApplications();
      if (window.loadJobs) window.loadJobs();
      if (window.loadDashboard) window.loadDashboard();

    } catch (err) {
      UI.showToast(err.message || 'Failed to delete application', 'error');
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Confirm Delete';
      pendingDeleteAppId = null;
    }
  };

  UI.openModal('modal-confirm-delete');
}

window.initApplications = initApplications;
window.loadApplications = loadApplications;
window.viewApplicationDetails = viewApplicationDetails;
window.openApplicationFormModal = openApplicationFormModal;
window.confirmDeleteApplication = confirmDeleteApplication;
window.handleInlineStatusChange = handleInlineStatusChange;
window.refreshJobSelectDropdowns = refreshJobSelectDropdowns;
