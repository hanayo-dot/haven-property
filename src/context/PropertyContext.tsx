import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Property, 
  Unit, 
  Tenant, 
  MaintenanceRequest, 
  ActiveTab, 
  ViewMode, 
  DamagePhoto, 
  TimelineEntry, 
  AIDiagnosis, 
  IssueStatus, 
  IssuePriority,
  User,
  UserRole 
} from '../types';
import { 
  INITIAL_PROPERTIES, 
  INITIAL_UNITS, 
  INITIAL_TENANTS, 
  INITIAL_MAINTENANCE_REQUESTS,
  DEMO_USERS 
} from '../data/mockData';
import { api } from '../services/api';
import { analyzeMaintenanceDamage } from '../services/geminiService';

interface PhotoViewerState {
  isOpen: boolean;
  photos: DamagePhoto[];
  initialIndex: number;
  title: string;
}

interface PropertyContextType {
  // Authentication
  currentUser: User | null;
  login: (identifierOrUser: string | User, password?: string, roleHint?: UserRole, nameHint?: string) => Promise<User>;
  register: (data: Partial<User> & { password?: string }) => Promise<User>;
  logout: () => void;
  authError: string | null;
  clearAuthError: () => void;

  properties: Property[];
  units: Unit[];
  tenants: Tenant[];
  maintenanceRequests: MaintenanceRequest[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // Selected detail states
  selectedRequestId: string | null;
  setSelectedRequestId: (id: string | null) => void;
  selectedPropertyId: string | null;
  setSelectedPropertyId: (id: string | null) => void;

  // Modals
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  isNewPropertyModalOpen: boolean;
  setIsNewPropertyModalOpen: (open: boolean) => void;
  isTenantLinkModalOpen: boolean;
  setIsTenantLinkModalOpen: (open: boolean) => void;
  tenantLinkUnitId: string | null;
  setTenantLinkUnitId: (unitId: string | null) => void;

  // Photo Viewer
  photoViewer: PhotoViewerState;
  openPhotoViewer: (photos: DamagePhoto[], index?: number, title?: string) => void;
  closePhotoViewer: () => void;

  // Actions
  addMaintenanceRequest: (request: Omit<MaintenanceRequest, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'timeline'> & { initialPhotos?: DamagePhoto[] }) => Promise<MaintenanceRequest>;
  updateMaintenanceRequest: (id: string, updates: Partial<MaintenanceRequest>) => void;
  deleteMaintenanceRequest: (id: string) => void;
  updateRequestStatus: (id: string, newStatus: IssueStatus, comment?: string) => void;
  updateRequestPriority: (id: string, newPriority: IssuePriority) => void;
  assignContractor: (id: string, contractor: { name: string; company: string; phone: string; whatsApp?: string; scheduledDate?: string; estimatedArrival?: string }, estimatedCost?: number) => void;
  addTimelineEntry: (id: string, entry: Omit<TimelineEntry, 'id' | 'timestamp'>) => void;

  // Property & Unit CRUD
  addProperty: (property: Omit<Property, 'id' | 'occupiedUnits' | 'monthlyRevenue'>) => Property;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  addUnit: (unit: Omit<Unit, 'id'>) => Unit;
  updateUnit: (id: string, updates: Partial<Unit>) => void;
  deleteUnit: (id: string) => void;
  addTenant: (tenant: Omit<Tenant, 'id'>) => Tenant;
  deleteTenant: (id: string) => void;

  // Utilities
  formatKsh: (amount: number) => string;
  resetToDemoData: () => Promise<void>;
  getUnitById: (unitId: string) => Unit | undefined;
  getPropertyById: (propertyId: string) => Property | undefined;
  getTenantById: (tenantId: string) => Tenant | undefined;
  getRequestsByProperty: (propertyId: string) => MaintenanceRequest[];
  getRequestsByUnit: (unitId: string) => MaintenanceRequest[];
  exportMaintenanceCSV: () => void;
  exportTenantsCSV: () => void;

  // Backend Sync Status
  isBackendOnline: boolean;

  // Computed Stats
  stats: {
    totalProperties: number;
    totalUnits: number;
    occupiedUnits: number;
    occupancyRate: number;
    monthlyRevenue: number;
    openIssues: number;
    emergencyIssues: number;
    scheduledIssues: number;
    resolvedIssues: number;
  };
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'haven_kenya_user_v1',
  TOKEN: 'haven_kenya_token_v1',
  PROPERTIES: 'haven_kenya_properties_v1',
  UNITS: 'haven_kenya_units_v1',
  TENANTS: 'haven_kenya_tenants_v1',
  REQUESTS: 'haven_kenya_requests_v1',
};

const generateId = (prefix: string): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
};

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      return saved && token ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      return saved ? JSON.parse(saved) : INITIAL_PROPERTIES;
    } catch {
      return INITIAL_PROPERTIES;
    }
  });

  const [units, setUnits] = useState<Unit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.UNITS);
      return saved ? JSON.parse(saved) : INITIAL_UNITS;
    } catch {
      return INITIAL_UNITS;
    }
  });

  const [tenants, setTenants] = useState<Tenant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TENANTS);
      return saved ? JSON.parse(saved) : INITIAL_TENANTS;
    } catch {
      return INITIAL_TENANTS;
    }
  });

  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE_REQUESTS;
    } catch {
      return INITIAL_MAINTENANCE_REQUESTS;
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return currentUser?.role === 'tenant' ? 'tenant-portal' : 'landlord';
  });

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isNewPropertyModalOpen, setIsNewPropertyModalOpen] = useState<boolean>(false);
  const [isTenantLinkModalOpen, setIsTenantLinkModalOpen] = useState<boolean>(false);
  const [tenantLinkUnitId, setTenantLinkUnitId] = useState<string | null>(null);

  const [photoViewer, setPhotoViewer] = useState<PhotoViewerState>({
    isOpen: false,
    photos: [],
    initialIndex: 0,
    title: ''
  });

  const [authError, setAuthError] = useState<string | null>(null);
  const clearAuthError = useCallback(() => setAuthError(null), []);

  // Auth actions
  const login = useCallback(async (
    identifierOrUser: string | User,
    password?: string,
    roleHint?: UserRole,
    nameHint?: string
  ): Promise<User> => {
    setAuthError(null);

    // If an entire User object is passed (e.g. 1-click preset)
    if (typeof identifierOrUser !== 'string') {
      const user = identifierOrUser;
      try {
        if (isBackendOnline) {
          const resp = await api.login(user.email || user.phone, user.password || 'haven2026', user.role, user.name);
          if (resp && resp.user) {
            setCurrentUser(resp.user);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(resp.user));
            setViewMode(resp.user.role === 'tenant' ? 'tenant-portal' : 'landlord');
            return resp.user;
          }
        }
      } catch (err: any) {
        console.warn('Backend login sync fallback:', err);
      }

      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      setViewMode(user.role === 'tenant' ? 'tenant-portal' : 'landlord');
      return user;
    }

    // String identifier (Email or Phone number typed in by user)
    const identifier = identifierOrUser.trim();
    try {
      if (isBackendOnline) {
        const resp = await api.login(identifier, password, roleHint, nameHint);
        if (resp && resp.user) {
          setCurrentUser(resp.user);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(resp.user));
          setViewMode(resp.user.role === 'tenant' ? 'tenant-portal' : 'landlord');
          return resp.user;
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setAuthError(msg);
      throw err;
    }

    // Fallback local match
    const cleanIdent = identifier.toLowerCase();
    const matched = DEMO_USERS.find(u => 
      u.email.toLowerCase() === cleanIdent || 
      u.phone.replace(/\s+/g, '') === identifier.replace(/\s+/g, '')
    );

    const activeUser: User = matched || {
      id: `user-${Date.now()}`,
      name: nameHint || (roleHint === 'landlord' ? 'Property Manager' : 'Apartment Resident'),
      email: identifier.includes('@') ? identifier : `resident.${identifier}@havenmgmt.co.ke`,
      phone: identifier.includes('@') ? '+254 700 000 000' : identifier,
      role: roleHint || 'tenant',
      propertyName: roleHint === 'landlord' ? undefined : 'Kilimani Heights Apartments',
      unitNumber: roleHint === 'landlord' ? undefined : '4B',
      rentAmount: roleHint === 'landlord' ? undefined : 75000,
      mpesaAccount: roleHint === 'landlord' ? undefined : 'HAVEN-4B'
    };

    setCurrentUser(activeUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(activeUser));
    setViewMode(activeUser.role === 'tenant' ? 'tenant-portal' : 'landlord');
    return activeUser;
  }, [isBackendOnline]);

  const register = useCallback(async (data: Partial<User> & { password?: string }): Promise<User> => {
    setAuthError(null);
    try {
      if (isBackendOnline) {
        const resp = await api.register(data);
        if (resp && resp.user) {
          setCurrentUser(resp.user);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(resp.user));
          setViewMode(resp.user.role === 'tenant' ? 'tenant-portal' : 'landlord');
          return resp.user;
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please try again.';
      setAuthError(msg);
      throw err;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name || 'Resident',
      email: data.email || '',
      phone: data.phone || '+254 700 000 000',
      role: data.role || 'tenant',
      propertyName: data.propertyName || (data.role === 'tenant' ? 'Kilimani Heights Apartments' : undefined),
      unitNumber: data.unitNumber || (data.role === 'tenant' ? '3A' : undefined),
      rentAmount: data.rentAmount || (data.role === 'tenant' ? 75000 : undefined),
      mpesaAccount: data.unitNumber ? `HAVEN-${data.unitNumber}` : 'HAVEN-3A'
    };

    setCurrentUser(newUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    setViewMode(newUser.role === 'tenant' ? 'tenant-portal' : 'landlord');
    return newUser;
  }, [isBackendOnline]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setAuthError(null);
    setViewMode('landlord');
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      sessionStorage.clear();
      // Clean URL params if any
      if (window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (e) {
      console.warn('Failed to clear user from storage:', e);
    }
  }, []);

  // Check and sync with Go backend on mount
  useEffect(() => {
    let isMounted = true;
    const initBackend = async () => {
      try {
        const healthy = await api.checkHealth();
        if (healthy && isMounted) {
          setIsBackendOnline(true);
          if (!localStorage.getItem(STORAGE_KEYS.TOKEN)) {
            if (isMounted) setCurrentUser(null);
            return;
          }
          const [backendProps, backendUnits, backendTenants, backendRequests] = await Promise.all([
            api.getProperties().catch(() => null),
            api.getUnits().catch(() => null),
            api.getTenants().catch(() => null),
            api.getMaintenanceRequests().catch(() => null)
          ]);
          if (backendProps && isMounted && backendProps.length > 0) setProperties(backendProps);
          if (backendUnits && isMounted && backendUnits.length > 0) setUnits(backendUnits);
          if (backendTenants && isMounted && backendTenants.length > 0) setTenants(backendTenants);
          if (backendRequests && isMounted && backendRequests.length > 0) setMaintenanceRequests(backendRequests);
        }
      } catch {
        if (isMounted) setIsBackendOnline(false);
      }
    };
    initBackend();
    return () => { isMounted = false; };
  }, [currentUser]);

  useEffect(() => {
    const handleAuthExpired = () => {
      setCurrentUser(null);
      setViewMode('landlord');
    };
    window.addEventListener('haven-auth-expired', handleAuthExpired);
    return () => window.removeEventListener('haven-auth-expired', handleAuthExpired);
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
    } catch (e) {
      console.warn('Failed to save properties to localStorage:', e);
    }
  }, [properties]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
    } catch (e) {
      console.warn('Failed to save units to localStorage:', e);
    }
  }, [units]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
    } catch (e) {
      console.warn('Failed to save tenants to localStorage:', e);
    }
  }, [tenants]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(maintenanceRequests));
    } catch (e) {
      console.warn('Failed to save maintenance requests to localStorage:', e);
    }
  }, [maintenanceRequests]);

  // Dynamic property enrichment with live unit calculations
  const enrichedProperties = useMemo(() => {
    return properties.map(property => {
      const propertyUnits = units.filter(u => u.propertyId === property.id);
      const totalUnits = propertyUnits.length || property.totalUnits;
      const occupiedUnits = propertyUnits.filter(u => u.status === 'Occupied').length;
      const monthlyRevenue = propertyUnits
        .filter(u => u.status === 'Occupied')
        .reduce((sum, u) => sum + (u.rentAmount || 0), 0);

      return {
        ...property,
        totalUnits,
        occupiedUnits,
        monthlyRevenue
      };
    });
  }, [properties, units]);

  // Compute portfolio stats dynamically
  const stats = useMemo(() => {
    const totalProperties = properties.length;
    const totalUnits = units.length;
    const occupiedUnits = units.filter(u => u.status === 'Occupied').length;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
    const monthlyRevenue = units
      .filter(u => u.status === 'Occupied')
      .reduce((sum, u) => sum + (u.rentAmount || 0), 0);

    const openIssues = maintenanceRequests.filter(r => r.status !== 'Resolved').length;
    const emergencyIssues = maintenanceRequests.filter(r => r.priority === 'Emergency' && r.status !== 'Resolved').length;
    const scheduledIssues = maintenanceRequests.filter(r => (r.status === 'Scheduled' || r.status === 'In Progress')).length;
    const resolvedIssues = maintenanceRequests.filter(r => r.status === 'Resolved').length;

    return {
      totalProperties,
      totalUnits,
      occupiedUnits,
      occupancyRate,
      monthlyRevenue,
      openIssues,
      emergencyIssues,
      scheduledIssues,
      resolvedIssues
    };
  }, [properties, units, maintenanceRequests]);

  const formatKsh = useCallback((amount: number): string => {
    return `KSh. ${amount.toLocaleString()}`;
  }, []);

  // Photo viewer helpers
  const openPhotoViewer = useCallback((photos: DamagePhoto[], index = 0, title = 'Inspection Photo') => {
    setPhotoViewer({
      isOpen: true,
      photos,
      initialIndex: index,
      title
    });
  }, []);

  const closePhotoViewer = useCallback(() => {
    setPhotoViewer(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Create Maintenance Request with AI
  const addMaintenanceRequest = async (
    data: Omit<MaintenanceRequest, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'timeline'> & { initialPhotos?: DamagePhoto[] }
  ): Promise<MaintenanceRequest> => {
    const ticketSeq = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TKT-${ticketSeq}`;
    const newId = generateId('req');
    const now = new Date().toISOString();

    const creationTimeline: TimelineEntry = {
      id: generateId('time'),
      timestamp: now,
      author: data.tenantName || 'Resident',
      role: 'tenant',
      title: 'Breakage Ticket Logged',
      description: `Report filed for ${data.propertyName} (Unit ${data.unitNumber}).`,
      type: 'creation'
    };

    let aiDiagnosis: AIDiagnosis | undefined = undefined;
    try {
      const photosBase64 = (data.photos || []).map(p => p.url);
      aiDiagnosis = await analyzeMaintenanceDamage(data.title, data.description, data.category, photosBase64);
    } catch (e) {
      console.warn('AI analysis fallback:', e);
    }

    const aiTimeline: TimelineEntry | null = aiDiagnosis ? {
      id: generateId('time'),
      timestamp: new Date().toISOString(),
      author: 'Gemini AI Vision',
      role: 'system',
      title: 'Multimodal Damage Assessment Completed',
      description: `${aiDiagnosis.categorySummary} • Est: ${aiDiagnosis.estimatedCostRange}`,
      type: 'status_change'
    } : null;

    const newRequest: MaintenanceRequest = {
      ...data,
      id: newId,
      ticketNumber,
      createdAt: now,
      updatedAt: now,
      photos: data.photos || [],
      timeline: aiTimeline ? [creationTimeline, aiTimeline] : [creationTimeline],
      aiDiagnosis
    };

    setMaintenanceRequests(prev => [newRequest, ...prev]);

    if (isBackendOnline) {
      api.createMaintenanceRequest(newRequest).catch(err => {
        console.warn('Failed to sync new ticket to Go backend:', err);
      });
    }

    return newRequest;
  };

  const updateRequestStatus = useCallback((id: string, newStatus: IssueStatus, comment?: string) => {
    setMaintenanceRequests(prev => prev.map(req => {
      if (req.id !== id) return req;

      const now = new Date().toISOString();
      const statusEntry: TimelineEntry = {
        id: generateId('time'),
        timestamp: now,
        author: currentUser?.name || 'Eleanor Wanjiku (Landlord)',
        role: currentUser?.role || 'landlord',
        title: `Status Changed to ${newStatus}`,
        description: comment || `Ticket marked as ${newStatus}.`,
        type: 'status_change'
      };

      return {
        ...req,
        status: newStatus,
        updatedAt: now,
        resolvedAt: newStatus === 'Resolved' ? now : req.resolvedAt,
        timeline: [...req.timeline, statusEntry]
      };
    }));

    if (isBackendOnline) {
      api.updateRequestStatus(id, newStatus, comment).catch(err => {
        console.warn('Backend sync status failed:', err);
      });
    }
  }, [currentUser, isBackendOnline]);

  const updateRequestPriority = useCallback((id: string, newPriority: IssuePriority) => {
    setMaintenanceRequests(prev => prev.map(req => {
      if (req.id !== id) return req;
      return {
        ...req,
        priority: newPriority,
        updatedAt: new Date().toISOString()
      };
    }));

    if (isBackendOnline) {
      api.updateRequestPriority(id, newPriority).catch(err => {
        console.warn('Backend sync priority failed:', err);
      });
    }
  }, [isBackendOnline]);

  const assignContractor = useCallback((
    id: string,
    contractor: { name: string; company: string; phone: string; whatsApp?: string; scheduledDate?: string; estimatedArrival?: string },
    estimatedCost?: number
  ) => {
    setMaintenanceRequests(prev => prev.map(req => {
      if (req.id !== id) return req;

      const now = new Date().toISOString();
      const contractorEntry: TimelineEntry = {
        id: generateId('time'),
        timestamp: now,
        author: currentUser?.name || 'Eleanor Wanjiku (Landlord)',
        role: 'landlord',
        title: `Fundi Dispatched: ${contractor.name}`,
        description: `Assigned ${contractor.name} (${contractor.company}) on ${contractor.scheduledDate || 'Today'}. Estimated: ${estimatedCost ? `KSh. ${estimatedCost.toLocaleString()}` : 'TBD'}`,
        type: 'contractor'
      };

      return {
        ...req,
        status: 'Scheduled',
        assignedContractor: contractor,
        repairCost: estimatedCost !== undefined ? estimatedCost : req.repairCost,
        updatedAt: now,
        timeline: [...req.timeline, contractorEntry]
      };
    }));

    if (isBackendOnline) {
      api.assignContractor(id, contractor, estimatedCost).catch(err => {
        console.warn('Backend sync contractor failed:', err);
      });
    }
  }, [currentUser, isBackendOnline]);

  const addTimelineEntry = useCallback((id: string, entry: Omit<TimelineEntry, 'id' | 'timestamp'>) => {
    const fullEntry: TimelineEntry = {
      ...entry,
      id: generateId('time'),
      timestamp: new Date().toISOString()
    };

    setMaintenanceRequests(prev => prev.map(req => {
      if (req.id !== id) return req;
      return {
        ...req,
        timeline: [...req.timeline, fullEntry]
      };
    }));

    if (isBackendOnline) {
      api.addTimelineEntry(id, fullEntry).catch(err => {
        console.warn('Backend sync timeline entry failed:', err);
      });
    }
  }, [isBackendOnline]);

  const updateMaintenanceRequest = useCallback((id: string, updates: Partial<MaintenanceRequest>) => {
    setMaintenanceRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
    if (isBackendOnline) {
      api.updateMaintenanceRequest(id, updates).catch(err => console.warn('Backend sync maintenance update failed:', err));
    }
  }, [isBackendOnline]);

  const deleteMaintenanceRequest = useCallback((id: string) => {
    setMaintenanceRequests(prev => prev.filter(r => r.id !== id));
    if (selectedRequestId === id) setSelectedRequestId(null);
    if (isBackendOnline) {
      api.deleteMaintenanceRequest(id).catch(err => console.warn('Backend sync maintenance delete failed:', err));
    }
  }, [isBackendOnline, selectedRequestId]);

  // Property CRUD
  const addProperty = (data: Omit<Property, 'id' | 'occupiedUnits' | 'monthlyRevenue'>): Property => {
    const newProp: Property = {
      ...data,
      id: generateId('prop'),
      occupiedUnits: 0,
      monthlyRevenue: 0
    };
    setProperties(prev => [...prev, newProp]);

    if (isBackendOnline) {
      api.createProperty(newProp).catch(err => console.warn('Go backend addProperty error:', err));
    }
    return newProp;
  };

  const updateProperty = useCallback((id: string, updates: Partial<Property>) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    if (isBackendOnline) {
      api.updateProperty(id, updates).catch(err => console.warn('Go backend updateProperty error:', err));
    }
  }, [isBackendOnline]);

  const deleteProperty = useCallback((id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
    setUnits(prev => prev.filter(u => u.propertyId !== id));
    if (isBackendOnline) {
      api.deleteProperty(id).catch(err => console.warn('Go backend deleteProperty error:', err));
    }
  }, [isBackendOnline]);

  // Unit CRUD
  const addUnit = (data: Omit<Unit, 'id'>): Unit => {
    const newUnit: Unit = {
      ...data,
      id: generateId('unit')
    };
    setUnits(prev => [...prev, newUnit]);

    if (isBackendOnline) {
      api.createUnit(newUnit).catch(err => console.warn('Go backend addUnit error:', err));
    }
    return newUnit;
  };

  const updateUnit = useCallback((id: string, updates: Partial<Unit>) => {
    setUnits(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (isBackendOnline) {
      api.updateUnit(id, updates).catch(err => console.warn('Go backend updateUnit error:', err));
    }
  }, [isBackendOnline]);

  const deleteUnit = useCallback((id: string) => {
    setUnits(prev => prev.filter(u => u.id !== id));
    if (isBackendOnline) {
      api.deleteUnit(id).catch(err => console.warn('Go backend deleteUnit error:', err));
    }
  }, [isBackendOnline]);

  // Tenant CRUD
  const addTenant = (data: Omit<Tenant, 'id'>): Tenant => {
    const newTenant: Tenant = {
      ...data,
      id: generateId('tenant'),
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`
    };
    setTenants(prev => [...prev, newTenant]);

    setUnits(prev => prev.map(u => {
      if (u.id === data.unitId) {
        return {
          ...u,
          status: 'Occupied',
          currentTenantId: newTenant.id,
          leaseStart: data.leaseStart,
          leaseEnd: data.leaseEnd
        };
      }
      return u;
    }));

    if (isBackendOnline) {
      api.createTenant(newTenant).catch(err => console.warn('Go backend addTenant error:', err));
    }
    return newTenant;
  };

  const deleteTenant = useCallback((id: string) => {
    setTenants(prev => prev.filter(t => t.id !== id));
    if (isBackendOnline) {
      api.deleteTenant(id).catch(err => console.warn('Go backend deleteTenant error:', err));
    }
  }, [isBackendOnline]);

  // Helper selectors
  const getUnitById = useCallback((unitId: string) => units.find(u => u.id === unitId), [units]);
  const getPropertyById = useCallback((propId: string) => properties.find(p => p.id === propId), [properties]);
  const getTenantById = useCallback((tenantId: string) => tenants.find(t => t.id === tenantId), [tenants]);
  const getRequestsByProperty = useCallback((propId: string) => maintenanceRequests.filter(r => r.propertyId === propId), [maintenanceRequests]);
  const getRequestsByUnit = useCallback((unitId: string) => maintenanceRequests.filter(r => r.unitId === unitId), [maintenanceRequests]);

  // CSV Exporters
  const exportMaintenanceCSV = useCallback(() => {
    if (isBackendOnline) {
      window.open('/api/export/maintenance', '_blank');
      return;
    }
    const headers = ['Ticket Number', 'Property', 'Unit', 'Tenant Name', 'Tenant Phone', 'Title', 'Category', 'Priority', 'Status', 'Fundi Assigned', 'Repair Cost (KSh)', 'Created At'];
    const rows = maintenanceRequests.map(r => [
      r.ticketNumber,
      `"${r.propertyName}"`,
      r.unitNumber,
      `"${r.tenantName}"`,
      `"${r.tenantPhone}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      r.category,
      r.priority,
      r.status,
      `"${r.assignedContractor?.name || ''}"`,
      r.repairCost ? r.repairCost.toString() : '',
      r.createdAt
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `haven_maintenance_kenya_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [isBackendOnline, maintenanceRequests]);

  const exportTenantsCSV = useCallback(() => {
    if (isBackendOnline) {
      window.open('/api/export/tenants', '_blank');
      return;
    }
    const headers = ['Resident Name', 'Property', 'Unit', 'Phone', 'Email', 'Monthly Rent (KSh)', 'Rent Status', 'Last M-Pesa Receipt', 'Lease End'];
    const rows = tenants.map(t => [
      `"${t.name}"`,
      `"${t.propertyName}"`,
      t.unitNumber,
      `"${t.phone}"`,
      t.email,
      t.rentAmount.toString(),
      t.rentStatus,
      t.lastMpesaReceipt || '',
      t.leaseEnd
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `haven_residents_kenya_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [isBackendOnline, tenants]);

  const resetToDemoData = async () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROPERTIES);
      localStorage.removeItem(STORAGE_KEYS.UNITS);
      localStorage.removeItem(STORAGE_KEYS.TENANTS);
      localStorage.removeItem(STORAGE_KEYS.REQUESTS);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);

      setProperties(INITIAL_PROPERTIES);
      setUnits(INITIAL_UNITS);
      setTenants(INITIAL_TENANTS);
      setMaintenanceRequests(INITIAL_MAINTENANCE_REQUESTS);
      setCurrentUser(DEMO_USERS[0]);
      setViewMode('landlord');

      if (isBackendOnline) {
        await api.resetData();
      }
    } catch (e) {
      console.error('Reset demo data failed:', e);
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    authError,
    clearAuthError,
    properties: enrichedProperties,
    units,
    tenants,
    maintenanceRequests,
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    selectedRequestId,
    setSelectedRequestId,
    selectedPropertyId,
    setSelectedPropertyId,
    isReportModalOpen,
    setIsReportModalOpen,
    isNewPropertyModalOpen,
    setIsNewPropertyModalOpen,
    isTenantLinkModalOpen,
    setIsTenantLinkModalOpen,
    tenantLinkUnitId,
    setTenantLinkUnitId,
    photoViewer,
    openPhotoViewer,
    closePhotoViewer,
    addMaintenanceRequest,
    updateMaintenanceRequest,
    deleteMaintenanceRequest,
    updateRequestStatus,
    updateRequestPriority,
    assignContractor,
    addTimelineEntry,
    addProperty,
    updateProperty,
    deleteProperty,
    addUnit,
    updateUnit,
    deleteUnit,
    addTenant,
    deleteTenant,
    formatKsh,
    resetToDemoData,
    getUnitById,
    getPropertyById,
    getTenantById,
    getRequestsByProperty,
    getRequestsByUnit,
    exportMaintenanceCSV,
    exportTenantsCSV,
    isBackendOnline,
    stats
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};
