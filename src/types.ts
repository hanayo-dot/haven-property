export type UserRole = 'landlord' | 'tenant';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  // Tenant-specific fields
  propertyId?: string;
  propertyName?: string;
  unitId?: string;
  unitNumber?: string;
  rentAmount?: number;
  leaseEnd?: string;
  mpesaAccount?: string;
}

export type IssueCategory = 
  | 'Plumbing'
  | 'Electrical'
  | 'Appliance'
  | 'HVAC / Climate'
  | 'Structural & Windows'
  | 'Locks & Security'
  | 'Pest Control'
  | 'Other';

export type IssuePriority = 'Emergency' | 'High' | 'Medium' | 'Low';

export type IssueStatus = 'New' | 'Under Review' | 'Scheduled' | 'In Progress' | 'Resolved';

export type RentStatus = 'Paid' | 'Pending' | 'Overdue';

export type UnitStatus = 'Occupied' | 'Vacant' | 'Maintenance';

export interface DamagePhoto {
  id: string;
  url: string;
  caption?: string;
  timestamp: string;
  tag?: string;
}

export interface TimelineEntry {
  id: string;
  timestamp: string;
  author: string;
  role: 'landlord' | 'tenant' | 'system' | 'contractor';
  title: string;
  description: string;
  type: 'status_change' | 'comment' | 'contractor' | 'cost' | 'creation';
}

export interface AIDiagnosis {
  categorySummary: string;
  severityAssessment: string;
  estimatedCostRange: string; // in KSh. (e.g. "KSh. 2,500 - KSh. 6,000")
  recommendedAction: string;
  urgentSafetyTips?: string[];
  suggestedTrade: string; // e.g. "Licensed Plumber / Nairobi Water Specialist"
}

export interface ContractorInfo {
  name: string;
  company: string;
  phone: string;
  whatsApp?: string;
  scheduledDate?: string;
  estimatedArrival?: string;
}

export interface MaintenanceRequest {
  id: string;
  ticketNumber: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitNumber: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  photos: DamagePhoto[];
  entryPermission: boolean;
  preferredTime?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedContractor?: ContractorInfo;
  repairCost?: number; // in KSh.
  landlordNotes?: string;
  timeline: TimelineEntry[];
  aiDiagnosis?: AIDiagnosis;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string; // e.g. "Nairobi"
  state: string; // e.g. "Nairobi County" / "Kilimani" / "Westlands"
  zip: string; // e.g. "00100"
  type: 'Apartment Complex' | 'Residential Court' | 'Townhouse' | 'Gated Community' | 'Condo';
  imageUrl: string;
  totalUnits: number;
  occupiedUnits: number;
  monthlyRevenue: number; // in KSh.
  description: string;
  yearBuilt: number;
  mpesaPaybill?: string;
  mpesaTill?: string;
  caretakerContact?: {
    name: string;
    phone: string;
    whatsApp?: string;
  };
  managerContact: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  floor: number;
  rentAmount: number; // in KSh.
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  status: UnitStatus;
  currentTenantId?: string;
  leaseStart?: string;
  leaseEnd?: string;
  depositAmount: number; // in KSh.
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitNumber: string;
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number; // in KSh.
  rentStatus: RentStatus;
  lastMpesaReceipt?: string;
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  avatarUrl?: string;
}

export type ActiveTab = 'overview' | 'maintenance' | 'properties' | 'tenants';
export type TenantTab = 'dashboard' | 'report' | 'tickets' | 'payments';
export type ViewMode = 'landlord' | 'tenant-portal';
