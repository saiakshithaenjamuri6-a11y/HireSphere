// HireSphere Main Application Controller
// Orchestrates SPA view routing, navigation state, and startup bootstrapping

const VIEWS = {
  dashboard: {
    sectionId: 'view-dashboard',
    title: 'Dashboard Overview',
    subtitle: 'Real-time recruitment metrics and hiring pipeline',
    loader: () => window.loadDashboard && window.loadDashboard()
  },
  jobs: {
    sectionId: 'view-jobs',
    title: 'Job Management',
    subtitle: 'Manage active postings, role specifications, and talent requisitions',
    loader: () => window.loadJobs && window.loadJobs()
  },
  applications: {
    sectionId: 'view-applications',
    title: 'Candidate Applications',
    subtitle: 'Track candidate progression, review resumes, and update hiring stages',
    loader: () => {
      if (window.refreshJobSelectDropdowns) window.refreshJobSelectDropdowns();
      if (window.loadApplications) window.loadApplications();
    }
  },
  settings: {
    sectionId: 'view-settings',
    title: 'System & Database Diagnostics',
    subtitle: 'Database connectivity, engine specifications, and runtime health',
    loader: () => window.loadSettings && window.loadSettings()
  }
};

let currentView = 'dashboard';

// Switch active view
function navigateTo(viewKey) {
  if (!VIEWS[viewKey]) viewKey = 'dashboard';
  currentView = viewKey;

  // Update navigation link states
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-nav') === viewKey);
  });

  // Switch view containers
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.remove('active');
  });

  const activeSection = document.getElementById(VIEWS[viewKey].sectionId);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  // Update header titles
  const titleEl = document.getElementById('page-title');
  const subEl = document.getElementById('page-subtitle');
  if (titleEl) titleEl.textContent = VIEWS[viewKey].title;
  if (subEl) subEl.textContent = VIEWS[viewKey].subtitle;

  // Close mobile sidebar if open
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.remove('mobile-open');

  // Trigger view data loader
  if (typeof VIEWS[viewKey].loader === 'function') {
    VIEWS[viewKey].loader();
  }

  // Update window URL hash cleanly without reload
  history.replaceState(null, null, `#${viewKey}`);
}

// Bootstrap Application
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Initializing HireSphere Application...');

  // Initialize individual feature modules
  if (window.initJobs) window.initJobs();
  if (window.initApplications) window.initApplications();
  if (window.initSettings) window.initSettings();

  // Navigation click listeners
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = el.getAttribute('data-nav');
      navigateTo(targetView);
    });
  });

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const sidebar = document.getElementById('sidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Top header quick action buttons
  const headerBtnJob = document.getElementById('header-btn-job');
  if (headerBtnJob) {
    headerBtnJob.addEventListener('click', () => {
      if (window.openJobFormModal) window.openJobFormModal();
    });
  }

  const headerBtnApp = document.getElementById('header-btn-app');
  if (headerBtnApp) {
    headerBtnApp.addEventListener('click', () => {
      if (window.openApplicationFormModal) window.openApplicationFormModal();
    });
  }

  // Check initial URL hash
  const initialHash = window.location.hash.replace('#', '');
  const startView = VIEWS[initialHash] ? initialHash : 'dashboard';

  // Load initial view
  navigateTo(startView);

  // Background check database status for footer pill
  if (window.loadSettings) {
    window.loadSettings();
  }
});
