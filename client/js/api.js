// HireSphere API Client
// Handles communication with backend Express REST endpoints

const API_BASE = '/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data.errors ? data.errors.join(' ') : (data.message || `Request failed with status ${response.status}`);
        const err = new Error(errorMsg);
        err.status = response.status;
        err.data = data;
        throw err;
      }

      return data;
    } catch (error) {
      console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error);
      throw error;
    }
  }

  // --- Jobs API ---
  async getJobs(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.location && params.location !== 'all') query.append('location', params.location);
    if (params.employment_type && params.employment_type !== 'all') query.append('employment_type', params.employment_type);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/jobs${qs}`);
  }

  async getJob(id) {
    return this.request(`/jobs/${id}`);
  }

  async createJob(jobData) {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
  }

  async updateJob(id, jobData) {
    return this.request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData)
    });
  }

  async deleteJob(id) {
    return this.request(`/jobs/${id}`, {
      method: 'DELETE'
    });
  }

  // --- Applications API ---
  async getApplications(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.job_id && params.job_id !== 'all') query.append('job_id', params.job_id);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/applications${qs}`);
  }

  async getApplication(id) {
    return this.request(`/applications/${id}`);
  }

  async createApplication(appData) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(appData)
    });
  }

  async updateApplication(id, appData) {
    return this.request(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appData)
    });
  }

  async updateApplicationStatus(id, application_status) {
    return this.request(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ application_status })
    });
  }

  async deleteApplication(id) {
    return this.request(`/applications/${id}`, {
      method: 'DELETE'
    });
  }

  // --- Dashboard API ---
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // --- Settings API ---
  async getSettingsStatus() {
    return this.request('/settings/status');
  }
}

// Global API instance
window.api = new ApiService();
