import { 
  Property, 
  Unit, 
  Tenant, 
  MaintenanceRequest, 
  IssueStatus, 
  IssuePriority, 
  TimelineEntry, 
  AIDiagnosis,
  User 
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }
  return res.json();
}

export const api = {
  // Health
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Stats
  async getStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/stats`);
    return handleResponse(res);
  },

  // Reset
  async resetToDemo(): Promise<void> {
    const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
    return handleResponse(res);
  },

  async resetData(): Promise<void> {
    return this.resetToDemo();
  },

  // Auth & Users
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/auth/users`);
    return handleResponse<User[]>(res);
  },

  async login(identifier: string, password?: string, role?: string, name?: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password, role, name })
    });
    return handleResponse<{ user: User; token: string }>(res);
  },

  async register(data: Partial<User> & { password?: string }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<{ user: User; token: string }>(res);
  },

  async getCurrentUser(identifier: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me?identifier=${encodeURIComponent(identifier)}`);
    return handleResponse<User>(res);
  },

  // Tenant Portal Specifics
  async getTenantTickets(params: { tenantName?: string; unitNumber?: string; unitId?: string }): Promise<MaintenanceRequest[]> {
    const query = new URLSearchParams();
    if (params.tenantName) query.set('tenantName', params.tenantName);
    if (params.unitNumber) query.set('unitNumber', params.unitNumber);
    if (params.unitId) query.set('unitId', params.unitId);

    const res = await fetch(`${API_BASE}/tenant/tickets?${query.toString()}`);
    return handleResponse<MaintenanceRequest[]>(res);
  },

  async simulateMpesaPayment(params: {
    tenantId?: string;
    phoneNumber: string;
    amount: number;
    account: string;
  }): Promise<{ success: boolean; receiptNumber: string; message: string; transactionTime: string }> {
    const res = await fetch(`${API_BASE}/tenant/mpesa/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return handleResponse<{ success: boolean; receiptNumber: string; message: string; transactionTime: string }>(res);
  },

  // Properties
  async getProperties(): Promise<Property[]> {
    const res = await fetch(`${API_BASE}/properties`);
    return handleResponse<Property[]>(res);
  },

  async createProperty(property: Omit<Property, 'id' | 'occupiedUnits' | 'monthlyRevenue'>): Promise<Property> {
    const res = await fetch(`${API_BASE}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(property)
    });
    return handleResponse<Property>(res);
  },

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleResponse<Property>(res);
  },

  async deleteProperty(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/properties/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  // Units
  async getUnits(propertyId?: string): Promise<Unit[]> {
    const url = propertyId ? `${API_BASE}/units?propertyId=${propertyId}` : `${API_BASE}/units`;
    const res = await fetch(url);
    return handleResponse<Unit[]>(res);
  },

  async createUnit(unit: Omit<Unit, 'id'>): Promise<Unit> {
    const res = await fetch(`${API_BASE}/units`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(unit)
    });
    return handleResponse<Unit>(res);
  },

  async updateUnit(id: string, updates: Partial<Unit>): Promise<Unit> {
    const res = await fetch(`${API_BASE}/units/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleResponse<Unit>(res);
  },

  async deleteUnit(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/units/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  // Tenants
  async getTenants(): Promise<Tenant[]> {
    const res = await fetch(`${API_BASE}/tenants`);
    return handleResponse<Tenant[]>(res);
  },

  async createTenant(tenant: Omit<Tenant, 'id'>): Promise<Tenant> {
    const res = await fetch(`${API_BASE}/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tenant)
    });
    return handleResponse<Tenant>(res);
  },

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const res = await fetch(`${API_BASE}/tenants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleResponse<Tenant>(res);
  },

  async deleteTenant(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/tenants/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  // Maintenance Requests
  async getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    const res = await fetch(`${API_BASE}/maintenance`);
    return handleResponse<MaintenanceRequest[]>(res);
  },

  async createMaintenanceRequest(request: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    const res = await fetch(`${API_BASE}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    return handleResponse<MaintenanceRequest>(res);
  },

  async updateMaintenanceRequest(id: string, updates: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    const res = await fetch(`${API_BASE}/maintenance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleResponse<MaintenanceRequest>(res);
  },

  async deleteMaintenanceRequest(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/maintenance/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  async updateMaintenanceStatus(id: string, status: IssueStatus, comment?: string): Promise<MaintenanceRequest> {
    const res = await fetch(`${API_BASE}/maintenance/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, comment })
    });
    return handleResponse<MaintenanceRequest>(res);
  },

  async updateRequestStatus(id: string, status: IssueStatus, comment?: string): Promise<MaintenanceRequest> {
    return this.updateMaintenanceStatus(id, status, comment);
  },

  async updateMaintenancePriority(id: string, priority: IssuePriority): Promise<MaintenanceRequest> {
    const res = await fetch(`${API_BASE}/maintenance/${id}/priority`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority })
    });
    return handleResponse<MaintenanceRequest>(res);
  },

  async updateRequestPriority(id: string, priority: IssuePriority): Promise<MaintenanceRequest> {
    return this.updateMaintenancePriority(id, priority);
  },

  async assignContractor(
    id: string, 
    contractor: { name: string; company: string; phone: string; whatsApp?: string; scheduledDate?: string; estimatedArrival?: string },
    estimatedCost?: number
  ): Promise<MaintenanceRequest> {
    const res = await fetch(`${API_BASE}/maintenance/${id}/contractor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...contractor, estimatedCost })
    });
    return handleResponse<MaintenanceRequest>(res);
  },

  async addTimelineEntry(id: string, entry: Omit<TimelineEntry, 'id' | 'timestamp'>): Promise<TimelineEntry> {
    const res = await fetch(`${API_BASE}/maintenance/${id}/timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    return handleResponse<TimelineEntry>(res);
  },

  // AI Damage Diagnostics
  async diagnoseAI(title: string, description: string, category: string, photos: string[]): Promise<AIDiagnosis> {
    const res = await fetch(`${API_BASE}/ai/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, category, photos: photos.slice(0, 3) })
    });
    return handleResponse<AIDiagnosis>(res);
  },

  // CSV Export Download Trigger
  triggerExport(type: 'maintenance' | 'tenants') {
    const url = `${API_BASE}/export/${type}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `haven_${type}_export.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};
