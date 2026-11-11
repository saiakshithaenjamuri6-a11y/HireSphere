// HireSphere Dashboard Controller
// Manages real-time statistics, analytical charts, and recent activity streams

let statusChartInstance = null;
let jobsChartInstance = null;

async function loadDashboard() {
  try {
    const response = await api.getDashboardStats();
    if (!response.success) throw new Error(response.message);

    const { summary, status_breakdown, recent_jobs, recent_applications, jobs_by_applications } = response.data;

    // 1. Render Summary KPI Metrics
    document.getElementById('stat-total-jobs').textContent = summary.total_jobs;
    document.getElementById('stat-total-apps').textContent = summary.total_applications;
    document.getElementById('stat-pending-apps').textContent = summary.pending_applications;
    document.getElementById('stat-shortlisted-apps').textContent = summary.shortlisted_applications;

    // Update sidebar badges too
    const sbJobs = document.getElementById('sidebar-jobs-count');
    const sbApps = document.getElementById('sidebar-apps-count');
    if (sbJobs) sbJobs.textContent = summary.total_jobs;
    if (sbApps) sbApps.textContent = summary.total_applications;

    // 2. Render Charts
    renderStatusChart(status_breakdown);
    renderJobsDistributionChart(jobs_by_applications);

    // 3. Render Recent Jobs
    renderRecentJobs(recent_jobs);

    // 4. Render Recent Applications
    renderRecentApplications(recent_applications);

  } catch (error) {
    console.error('Failed to load dashboard:', error);
    UI.showToast('Unable to load dashboard metrics. Check database connection.', 'error');
  }
}

// Render Status Doughnut Chart
function renderStatusChart(breakdown) {
  const ctx = document.getElementById('chart-status-breakdown');
  if (!ctx || typeof Chart === 'undefined') return;

  const labels = ['Pending', 'Reviewed', 'Shortlisted', 'Hired', 'Rejected'];
  const data = [
    breakdown.Pending || 0,
    breakdown.Reviewed || 0,
    breakdown.Shortlisted || 0,
    breakdown.Hired || 0,
    breakdown.Rejected || 0
  ];

  const colors = [
    '#f59e0b', // amber (Pending)
    '#3b82f6', // blue (Reviewed)
    '#a855f7', // purple (Shortlisted)
    '#10b981', // emerald (Hired)
    '#f43f5e'  // rose (Rejected)
  ];

  if (statusChartInstance) {
    statusChartInstance.destroy();
  }

  statusChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12,
            font: { family: 'Inter', size: 12 },
            padding: 14
          }
        },
        tooltip: {
          padding: 10,
          boxPadding: 4,
          cornerRadius: 6
        }
      },
      cutout: '68%'
    }
  });
}

// Render Top Jobs Horizontal Bar Chart
function renderJobsDistributionChart(jobsData) {
  const ctx = document.getElementById('chart-jobs-distribution');
  if (!ctx || typeof Chart === 'undefined') return;

  const validJobs = (jobsData || []).filter(j => j.applications_count > 0);
  const labels = validJobs.length > 0 ? validJobs.map(j => j.job_title) : ['No applications yet'];
  const counts = validJobs.length > 0 ? validJobs.map(j => j.applications_count) : [0];

  if (jobsChartInstance) {
    jobsChartInstance.destroy();
  }

  jobsChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Candidates',
        data: counts,
        backgroundColor: '#2563eb',
        borderRadius: 4,
        maxBarThickness: 24
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          cornerRadius: 6,
          padding: 8
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { precision: 0, font: { family: 'Inter', size: 11 } },
          grid: { color: '#f1f5f9' }
        },
        y: {
          ticks: {
            font: { family: 'Inter', size: 11 },
            callback: function(val) {
              const label = this.getLabelForValue(val);
              return label.length > 22 ? label.substring(0, 20) + '...' : label;
            }
          },
          grid: { display: false }
        }
      }
    }
  });
}

// Render Recent Jobs table on Dashboard
function renderRecentJobs(jobs) {
  const tbody = document.getElementById('dashboard-recent-jobs-tbody');
  if (!tbody) return;

  if (!jobs || jobs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--slate-400);">No jobs posted yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = jobs.map(job => `
    <tr>
      <td>
        <div class="table-primary-text">${UI.escapeHtml(job.job_title)}</div>
        <div class="table-secondary-text">${UI.escapeHtml(job.company_name)}</div>
      </td>
      <td>${UI.escapeHtml(job.location || 'Remote')}</td>
      <td>
        <span class="skill-tag">${UI.escapeHtml(job.employment_type || 'Full-time')}</span>
      </td>
      <td><strong>${job.applications_count}</strong> candidates</td>
      <td style="text-align: right;">
        <button class="btn btn-secondary btn-sm" onclick="viewJobDetails(${job.id})">Details</button>
      </td>
    </tr>
  `).join('');
}

// Render Recent Applications on Dashboard
function renderRecentApplications(apps) {
  const tbody = document.getElementById('dashboard-recent-apps-tbody');
  if (!tbody) return;

  if (!apps || apps.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px; color: var(--slate-400);">No candidate applications yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = apps.map(app => `
    <tr>
      <td>
        <div class="table-primary-text">${UI.escapeHtml(app.applicant_name)}</div>
        <div class="table-secondary-text">${UI.escapeHtml(app.applicant_email)}</div>
      </td>
      <td>
        <div class="table-primary-text" style="font-size:12px;">${UI.escapeHtml(app.job_title)}</div>
        <div class="table-secondary-text">${UI.escapeHtml(app.company_name)}</div>
      </td>
      <td>${UI.getStatusBadgeHtml(app.application_status)}</td>
      <td style="text-align: right;">
        <button class="btn btn-secondary btn-sm" onclick="viewApplicationDetails(${app.id})">View</button>
      </td>
    </tr>
  `).join('');
}

window.loadDashboard = loadDashboard;
