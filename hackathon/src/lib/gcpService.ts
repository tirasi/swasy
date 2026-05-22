const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class GCPService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  }

  // Auth
  async login(email: string, password: string, role: string) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
    
    if (result.token) {
      this.token = result.token;
      localStorage.setItem('authToken', result.token);
    }
    
    return result;
  }

  // Patients
  async getPatients(filters?: any) {
    const query = filters ? `?${new URLSearchParams(filters)}` : '';
    return this.request(`/patients${query}`);
  }

  async getPatient(id: string) {
    return this.request(`/patients/${id}`);
  }

  async createPatient(data: any) {
    return this.request('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePatient(id: string, updates: any) {
    return this.request(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Doctors
  async getDoctors() {
    return this.request('/doctors');
  }

  async getDoctor(id: string) {
    return this.request(`/doctors/${id}`);
  }

  async createDoctor(data: any) {
    return this.request('/doctors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Appointments
  async getAppointments(filters?: any) {
    const query = filters ? `?${new URLSearchParams(filters)}` : '';
    return this.request(`/appointments${query}`);
  }

  async createAppointment(data: any) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAppointment(id: string, updates: any) {
    return this.request(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteAppointment(id: string) {
    return this.request(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // Health
  async healthCheck() {
    return this.request('/health');
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
  }
}

export const gcpService = new GCPService();
