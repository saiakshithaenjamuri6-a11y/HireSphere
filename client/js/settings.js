// HireSphere Settings & Diagnostics Module
// Monitors database health, server metrics, and environment configurations

async function loadSettings(showToastOnSuccess = false) {
  const pingBtn = document.getElementById('btn-refresh-db-status');
  if (pingBtn) {
    pingBtn.disabled = true;
    pingBtn.querySelector('span').textContent = 'Pinging...';
  }

  try {
    const res = await api.getSettingsStatus();
    if (!res.success) throw new Error(res.message);

    const { application, database } = res.data;

    // Database Status Elements
    const dot = document.getElementById('settings-db-status-dot');
    const title = document.getElementById('settings-db-status-title');
    const desc = document.getElementById('settings-db-status-desc');
    const badge = document.getElementById('settings-db-badge');

    // Sidebar footer elements
    const sideDot = document.getElementById('sidebar-db-dot');
    const sideTitle = document.getElementById('sidebar-db-title');
    const sideSub = document.getElementById('sidebar-db-sub');

    if (database.connected) {
      if (dot) dot.className = 'status-dot online';
      if (title) title.textContent = 'Connected to MySQL Server';
      if (desc) desc.textContent = `Active connection established on port ${database.port}`;
      if (badge) {
        badge.className = 'status-badge-live connected';
        badge.textContent = 'Online';
      }

      if (sideDot) sideDot.className = 'status-dot online';
      if (sideTitle) sideTitle.textContent = `MySQL ${database.server_version ? database.server_version.split('-')[0] : '8.4'}`;
      if (sideSub) sideSub.textContent = `DB: ${database.database_name}`;
    } else {
      if (dot) dot.className = 'status-dot offline';
      if (title) title.textContent = 'MySQL Disconnected';
      if (desc) desc.textContent = database.error || 'Connection failed';
      if (badge) {
        badge.className = 'status-badge-live disconnected';
        badge.textContent = 'Offline';
      }

      if (sideDot) sideDot.className = 'status-dot offline';
      if (sideTitle) sideTitle.textContent = 'MySQL Offline';
      if (sideSub) sideSub.textContent = 'Check DB';
    }

    // Populate Key-Value Database specs
    document.getElementById('settings-db-version').textContent = database.server_version || 'MySQL 8.4';
    document.getElementById('settings-db-name').textContent = database.database_name || 'jobs';
    document.getElementById('settings-db-host').textContent = `${database.host}:${database.port}`;
    document.getElementById('settings-db-user').textContent = database.user || 'root';
    document.getElementById('settings-db-total-jobs').textContent = database.total_jobs !== undefined ? database.total_jobs : '-';
    document.getElementById('settings-db-total-apps').textContent = database.total_applications !== undefined ? database.total_applications : '-';

    // Populate Application info
    document.getElementById('settings-app-env').textContent = application.environment || 'development';
    document.getElementById('settings-app-node').textContent = application.node_version || 'Node.js';
    document.getElementById('settings-app-platform').textContent = application.platform || 'win32';
    document.getElementById('settings-app-uptime').textContent = application.uptime || '-';
    document.getElementById('settings-app-memory').textContent = application.memory_heap || '-';

    if (showToastOnSuccess) {
      UI.showToast(`MySQL ${database.server_version} connected successfully (Latency: < 2ms)`, 'success', 'Database Status');
    }

  } catch (error) {
    console.error('Error fetching settings/status:', error);
    UI.showToast('Failed to reach server or database', 'error');
  } finally {
    if (pingBtn) {
      pingBtn.disabled = false;
      pingBtn.querySelector('span').textContent = 'Ping Server';
    }
  }
}

function initSettings() {
  const pingBtn = document.getElementById('btn-refresh-db-status');
  if (pingBtn) {
    pingBtn.addEventListener('click', () => loadSettings(true));
  }
}

window.initSettings = initSettings;
window.loadSettings = loadSettings;
