import { Property, Unit, Tenant, MaintenanceRequest, User } from '../types';

export const DEMO_USERS: User[] = [
  {
    id: 'user-landlord-1',
    name: 'Eleanor Wanjiku Kamau',
    email: 'wanjiku@havenmgmt.co.ke',
    phone: '+254 722 555 101',
    role: 'landlord',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'user-tenant-1',
    name: 'Juma Ochieng',
    email: 'juma.ochieng@gmail.com',
    phone: '+254 712 345 678',
    role: 'tenant',
    propertyId: 'prop-1',
    propertyName: 'Kilimani Heights Apartments',
    unitId: 'unit-101',
    unitNumber: '4B',
    rentAmount: 75000,
    leaseEnd: '2026-12-31',
    mpesaAccount: 'HAVEN-4B',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'user-tenant-2',
    name: 'Wanjiru Mwangi',
    email: 'wanjiru.m@yahoo.com',
    phone: '+254 721 554 433',
    role: 'tenant',
    propertyId: 'prop-2',
    propertyName: 'Westlands Green Suites',
    unitId: 'unit-201',
    unitNumber: '2A',
    rentAmount: 85000,
    leaseEnd: '2026-11-30',
    mpesaAccount: 'HAVEN-2A',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'user-tenant-3',
    name: 'Fatuma Hassan',
    email: 'fatuma.hassan@outlook.com',
    phone: '+254 701 223 344',
    role: 'tenant',
    propertyId: 'prop-3',
    propertyName: 'Kileleshwa Terraces',
    unitId: 'unit-301',
    unitNumber: '3C',
    rentAmount: 110000,
    leaseEnd: '2027-01-31',
    mpesaAccount: 'HAVEN-3C',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
  }
];

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    name: 'Kilimani Heights Apartments',
    address: 'Kindaruma Road, off Ngong Road',
    city: 'Nairobi',
    state: 'Kilimani',
    zip: '00100',
    type: 'Apartment Complex',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    totalUnits: 8,
    occupiedUnits: 7,
    monthlyRevenue: 535000,
    description: 'Modern residential tower in Kilimani with high-speed lifts, borehole water backup, solar water heating, and 24/7 CCTV security.',
    yearBuilt: 2021,
    mpesaPaybill: '880120',
    caretakerContact: {
      name: 'Mwangi Kamau (Caretaker)',
      phone: '+254 722 123 456',
      whatsApp: '254722123456'
    },
    managerContact: {
      name: 'Eleanor Wanjiku',
      phone: '+254 722 555 101',
      email: 'wanjiku@havenmgmt.co.ke'
    }
  },
  {
    id: 'prop-2',
    name: 'Westlands Green Suites',
    address: 'Muthithi Road, Westlands',
    city: 'Nairobi',
    state: 'Westlands',
    zip: '00800',
    type: 'Residential Court',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    totalUnits: 6,
    occupiedUnits: 6,
    monthlyRevenue: 520000,
    description: 'Executive serviced apartments in prime Westlands near Sarit Centre. Features rooftop terrace, dedicated parking, and fiber internet.',
    yearBuilt: 2020,
    mpesaPaybill: '880120',
    caretakerContact: {
      name: 'Otieno Peter (Caretaker)',
      phone: '+254 733 987 654',
      whatsApp: '254733987654'
    },
    managerContact: {
      name: 'Eleanor Wanjiku',
      phone: '+254 722 555 101',
      email: 'wanjiku@havenmgmt.co.ke'
    }
  },
  {
    id: 'prop-3',
    name: 'Kileleshwa Terraces',
    address: 'Githunguri Road, Kileleshwa',
    city: 'Nairobi',
    state: 'Kileleshwa',
    zip: '00100',
    type: 'Gated Community',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    totalUnits: 4,
    occupiedUnits: 3,
    monthlyRevenue: 345000,
    description: 'Spacious 3-bedroom luxury townhouses with private garden balconies, perimeter electric fence, and serene leafy surroundings.',
    yearBuilt: 2022,
    mpesaPaybill: '880120',
    caretakerContact: {
      name: 'Kariuki Denis (Caretaker)',
      phone: '+254 711 334 455',
      whatsApp: '254711334455'
    },
    managerContact: {
      name: 'Eleanor Wanjiku',
      phone: '+254 722 555 101',
      email: 'wanjiku@havenmgmt.co.ke'
    }
  }
];

export const INITIAL_UNITS: Unit[] = [
  // Kilimani Heights (prop-1)
  {
    id: 'unit-101',
    propertyId: 'prop-1',
    unitNumber: '4B',
    floor: 4,
    rentAmount: 75000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1100,
    status: 'Occupied',
    currentTenantId: 'tenant-1',
    leaseStart: '2025-01-01',
    leaseEnd: '2026-12-31',
    depositAmount: 75000
  },
  {
    id: 'unit-102',
    propertyId: 'prop-1',
    unitNumber: '1A',
    floor: 1,
    rentAmount: 65000,
    bedrooms: 2,
    bathrooms: 1.5,
    sqft: 950,
    status: 'Occupied',
    currentTenantId: 'tenant-3',
    leaseStart: '2024-06-01',
    leaseEnd: '2026-05-31',
    depositAmount: 65000
  },
  {
    id: 'unit-103',
    propertyId: 'prop-1',
    unitNumber: '2B',
    floor: 2,
    rentAmount: 75000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1100,
    status: 'Occupied',
    depositAmount: 75000
  },
  {
    id: 'unit-104',
    propertyId: 'prop-1',
    unitNumber: '3A',
    floor: 3,
    rentAmount: 85000,
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 1450,
    status: 'Vacant',
    depositAmount: 85000
  },

  // Westlands Green Suites (prop-2)
  {
    id: 'unit-201',
    propertyId: 'prop-2',
    unitNumber: '2A',
    floor: 2,
    rentAmount: 85000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    status: 'Occupied',
    currentTenantId: 'tenant-2',
    leaseStart: '2024-12-01',
    leaseEnd: '2026-11-30',
    depositAmount: 85000
  },
  {
    id: 'unit-202',
    propertyId: 'prop-2',
    unitNumber: '1B',
    floor: 1,
    rentAmount: 75000,
    bedrooms: 2,
    bathrooms: 1.5,
    sqft: 1050,
    status: 'Occupied',
    currentTenantId: 'tenant-5',
    leaseStart: '2025-02-01',
    leaseEnd: '2027-01-31',
    depositAmount: 75000
  },

  // Kileleshwa Terraces (prop-3)
  {
    id: 'unit-301',
    propertyId: 'prop-3',
    unitNumber: '3C',
    floor: 3,
    rentAmount: 110000,
    bedrooms: 3,
    bathrooms: 3,
    sqft: 1800,
    status: 'Occupied',
    currentTenantId: 'tenant-4',
    leaseStart: '2025-01-15',
    leaseEnd: '2027-01-31',
    depositAmount: 110000
  },
  {
    id: 'unit-302',
    propertyId: 'prop-3',
    unitNumber: '1A',
    floor: 1,
    rentAmount: 115000,
    bedrooms: 3,
    bathrooms: 3,
    sqft: 1850,
    status: 'Vacant',
    depositAmount: 115000
  }
];

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'Juma Ochieng',
    email: 'juma.ochieng@gmail.com',
    phone: '+254 712 345 678',
    propertyId: 'prop-1',
    propertyName: 'Kilimani Heights Apartments',
    unitId: 'unit-101',
    unitNumber: '4B',
    leaseStart: '2025-01-01',
    leaseEnd: '2026-12-31',
    rentAmount: 75000,
    rentStatus: 'Paid',
    lastMpesaReceipt: 'QKH8291KL0',
    emergencyContact: {
      name: 'Akinyi Ochieng (Sister)',
      relation: 'Sibling',
      phone: '+254 722 998 877'
    },
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'tenant-2',
    name: 'Wanjiru Mwangi',
    email: 'wanjiru.m@yahoo.com',
    phone: '+254 721 554 433',
    propertyId: 'prop-2',
    propertyName: 'Westlands Green Suites',
    unitId: 'unit-201',
    unitNumber: '2A',
    leaseStart: '2024-12-01',
    leaseEnd: '2026-11-30',
    rentAmount: 85000,
    rentStatus: 'Paid',
    lastMpesaReceipt: 'QKJ9921AA1',
    emergencyContact: {
      name: 'Kamau Mwangi (Father)',
      relation: 'Parent',
      phone: '+254 733 112 233'
    },
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'tenant-3',
    name: 'Kiprono Kipkemboi',
    email: 'kiprono.k@gmail.com',
    phone: '+254 728 776 655',
    propertyId: 'prop-1',
    propertyName: 'Kilimani Heights Apartments',
    unitId: 'unit-102',
    unitNumber: '1A',
    leaseStart: '2024-06-01',
    leaseEnd: '2026-05-31',
    rentAmount: 65000,
    rentStatus: 'Pending',
    emergencyContact: {
      name: 'Chebet Kiprono (Spouse)',
      relation: 'Spouse',
      phone: '+254 720 445 566'
    },
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'tenant-4',
    name: 'Fatuma Hassan',
    email: 'fatuma.hassan@outlook.com',
    phone: '+254 701 223 344',
    propertyId: 'prop-3',
    propertyName: 'Kileleshwa Terraces',
    unitId: 'unit-301',
    unitNumber: '3C',
    leaseStart: '2025-01-15',
    leaseEnd: '2027-01-31',
    rentAmount: 110000,
    rentStatus: 'Paid',
    lastMpesaReceipt: 'QKX3312PP8',
    emergencyContact: {
      name: 'Ali Hassan (Brother)',
      relation: 'Sibling',
      phone: '+254 711 778 899'
    },
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'tenant-5',
    name: 'Brian Mutua',
    email: 'brian.mutua@techke.org',
    phone: '+254 715 667 788',
    propertyId: 'prop-2',
    propertyName: 'Westlands Green Suites',
    unitId: 'unit-202',
    unitNumber: '1B',
    leaseStart: '2025-02-01',
    leaseEnd: '2027-01-31',
    rentAmount: 75000,
    rentStatus: 'Overdue',
    emergencyContact: {
      name: 'Faith Mutua (Mother)',
      relation: 'Parent',
      phone: '+254 722 001 122'
    },
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80'
  }
];

export const INITIAL_MAINTENANCE_REQUESTS: MaintenanceRequest[] = [
  {
    id: 'req-1',
    ticketNumber: 'TKT-4892',
    propertyId: 'prop-1',
    propertyName: 'Kilimani Heights Apartments',
    unitId: 'unit-101',
    unitNumber: '4B',
    tenantName: 'Juma Ochieng',
    tenantPhone: '+254 712 345 678',
    tenantEmail: 'juma.ochieng@gmail.com',
    title: 'Under-sink water pipe leaking into kitchen cabinet',
    description: 'Active drip beneath the kitchen sink basin from the P-trap drainage pipe. Water collecting on cabinet floor and spreading.',
    category: 'Plumbing',
    priority: 'Emergency',
    status: 'Scheduled',
    entryPermission: true,
    preferredTime: 'Morning (9:00 AM - 12:00 PM)',
    createdAt: '2026-08-18T08:30:00Z',
    updatedAt: '2026-08-18T10:15:00Z',
    photos: [
      {
        id: 'photo-1',
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
        caption: 'P-trap joint dripping under kitchen sink',
        timestamp: '2026-08-18T08:25:00Z',
        tag: 'Plumbing Joint'
      }
    ],
    assignedContractor: {
      name: 'Fundi John Onyango',
      company: 'Apex Plumbing & Drainage Nairobi',
      phone: '+254 722 889 900',
      whatsApp: '254722889900',
      scheduledDate: '2026-08-20',
      estimatedArrival: '10:00 AM - 12:00 PM'
    },
    repairCost: 4500,
    timeline: [
      {
        id: 'time-1',
        timestamp: '2026-08-18T08:30:00Z',
        author: 'Juma Ochieng',
        role: 'tenant',
        title: 'Breakage Ticket Logged',
        description: 'Resident submitted emergency leak report with photo evidence via QR code.',
        type: 'creation'
      },
      {
        id: 'time-2',
        timestamp: '2026-08-18T08:31:00Z',
        author: 'Gemini AI Vision',
        role: 'system',
        title: 'AI Damage Inspection Completed',
        description: 'Identified P-trap compression gasket wear. Urgency rated Emergency due to potential cabinet soaking.',
        type: 'status_change'
      },
      {
        id: 'time-3',
        timestamp: '2026-08-18T10:15:00Z',
        author: 'Eleanor Wanjiku (Landlord)',
        role: 'landlord',
        title: 'Fundi Dispatched',
        description: 'Assigned Fundi John Onyango from Apex Plumbing. Arrival booked for 10:00 AM.',
        type: 'contractor'
      }
    ],
    aiDiagnosis: {
      categorySummary: 'Plumbing Drainage Line Gasket Failure',
      severityAssessment: 'Emergency: Constant moisture risks cabinet warping and floor seepage.',
      estimatedCostRange: 'KSh. 2,500 - KSh. 5,500 (Gasket replacement & pipe sealing)',
      recommendedAction: 'Isolate cold water shutoff valve. Replace slip-joint washers and tighten collar.',
      urgentSafetyTips: [
        'Turn off the angle valve under the sink',
        'Place a basin under the trap to protect cabinetry',
        'Avoid pouring boiling oil or harsh chemicals down drain'
      ],
      suggestedTrade: 'Licensed Plumber / Nairobi Water Specialist'
    }
  },
  {
    id: 'req-2',
    ticketNumber: 'TKT-4893',
    propertyId: 'prop-2',
    propertyName: 'Westlands Green Suites',
    unitId: 'unit-201',
    unitNumber: '2A',
    tenantName: 'Wanjiru Mwangi',
    tenantPhone: '+254 721 554 433',
    tenantEmail: 'wanjiru.m@yahoo.com',
    title: 'Balcony sliding door latch jammed & off track',
    description: 'Balcony aluminium glass door will not slide smoothly or lock securely from the inside.',
    category: 'Locks & Security',
    priority: 'High',
    status: 'Under Review',
    entryPermission: true,
    preferredTime: 'Afternoon (2:00 PM - 5:00 PM)',
    createdAt: '2026-08-18T14:20:00Z',
    updatedAt: '2026-08-18T14:20:00Z',
    photos: [
      {
        id: 'photo-2',
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
        caption: 'Aluminium bottom rail and latch strike plate',
        timestamp: '2026-08-18T14:15:00Z',
        tag: 'Door Latch'
      }
    ],
    timeline: [
      {
        id: 'time-4',
        timestamp: '2026-08-18T14:20:00Z',
        author: 'Wanjiru Mwangi',
        role: 'tenant',
        title: 'Breakage Ticket Logged',
        description: 'Resident reported security door defect.',
        type: 'creation'
      }
    ],
    aiDiagnosis: {
      categorySummary: 'Aluminium Slider Roller Alignment & Latch Fault',
      severityAssessment: 'High: Balcony security vulnerability on lower floors.',
      estimatedCostRange: 'KSh. 3,000 - KSh. 6,500 (Roller replacement & strike realignment)',
      recommendedAction: 'Adjust bottom tandem roller tension screws and align mortise latch.',
      urgentSafetyTips: [
        'Secure secondary balcony bar lock if available',
        'Avoid forcing the glass sash'
      ],
      suggestedTrade: 'Aluminium Fabricator / Locksmith'
    }
  },
  {
    id: 'req-3',
    ticketNumber: 'TKT-4890',
    propertyId: 'prop-3',
    propertyName: 'Kileleshwa Terraces',
    unitId: 'unit-301',
    unitNumber: '3C',
    tenantName: 'Fatuma Hassan',
    tenantPhone: '+254 701 223 344',
    tenantEmail: 'fatuma.hassan@outlook.com',
    title: 'Instant shower heating unit tripping main MCB breaker',
    description: 'When switching on the master bathroom instant shower, the 20A circuit breaker trips immediately in the distribution board.',
    category: 'Electrical',
    priority: 'High',
    status: 'In Progress',
    entryPermission: false,
    preferredTime: 'Evening (5:00 PM - 7:00 PM)',
    createdAt: '2026-08-17T11:00:00Z',
    updatedAt: '2026-08-19T09:00:00Z',
    photos: [
      {
        id: 'photo-3',
        url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1000&q=80',
        caption: 'Lorenzetti instant shower unit',
        timestamp: '2026-08-17T10:50:00Z',
        tag: 'Electrical Unit'
      }
    ],
    assignedContractor: {
      name: 'Fundi Kariuki Mwangi',
      company: 'Starlight Electrical Nairobi',
      phone: '+254 733 445 566',
      whatsApp: '254733445566',
      scheduledDate: '2026-08-19',
      estimatedArrival: '5:30 PM'
    },
    repairCost: 3800,
    timeline: [
      {
        id: 'time-5',
        timestamp: '2026-08-17T11:00:00Z',
        author: 'Fatuma Hassan',
        role: 'tenant',
        title: 'Breakage Ticket Logged',
        description: 'Instant shower short-circuit reported.',
        type: 'creation'
      },
      {
        id: 'time-6',
        timestamp: '2026-08-19T09:00:00Z',
        author: 'Eleanor Wanjiku (Landlord)',
        role: 'landlord',
        title: 'Electrician Scheduled',
        description: 'Fundi Kariuki Mwangi dispatched for evening inspection.',
        type: 'contractor'
      }
    ],
    aiDiagnosis: {
      categorySummary: 'Instant Water Heater Heating Element Short',
      severityAssessment: 'High: Tripping breaker indicates heating element burnout or earth fault.',
      estimatedCostRange: 'KSh. 2,000 - KSh. 4,500 (Element replacement or DP switch check)',
      recommendedAction: 'Test element resistance with multimeter. Replace heating cartridge.',
      urgentSafetyTips: [
        'Keep DP wall switch turned OFF until technician arrives',
        'Do not touch showerhead while power is engaged'
      ],
      suggestedTrade: 'Licensed Electrician'
    }
  }
];

export const SAMPLE_BREAKAGE_PRESETS = [
  {
    title: 'Kitchen Sink P-Trap Leak & Cabinet Dripping',
    category: 'Plumbing',
    priority: 'Emergency',
    description: 'Water leaking heavily from the P-trap connector under the kitchen sink. Water is pooling on the wooden shelf.',
    photoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
    caption: 'Leaking PVC P-trap pipe fitting'
  },
  {
    title: 'Instant Shower Breaker Tripping',
    category: 'Electrical',
    priority: 'High',
    description: 'Master bath shower unit immediately trips the consumer board switch when turned on.',
    photoUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1000&q=80',
    caption: 'Instant water heater element fault'
  },
  {
    title: 'Balcony Glass Slider Latch Damaged',
    category: 'Locks & Security',
    priority: 'High',
    description: 'Sliding balcony door latch hook broke off and door jumps off bottom track.',
    photoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    caption: 'Broken aluminium door latch and rail'
  }
];
