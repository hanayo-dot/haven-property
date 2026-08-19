import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  Home, 
  Building2, 
  PlusCircle, 
  Calendar, 
  ShieldCheck, 
  QrCode, 
  Wrench, 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Download,
  Plus,
  CreditCard
} from 'lucide-react';
import { useProperty } from '../context/PropertyContext';

export const TenantsView: React.FC = () => {
  const { 
    tenants, 
    units, 
    properties, 
    maintenanceRequests, 
    addTenant, 
    setSelectedRequestId, 
    setActiveTab,
    setIsTenantLinkModalOpen,
    setTenantLinkUnitId,
    exportTenantsCSV,
    formatKsh 
  } = useProperty();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id || '');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [leaseStart, setLeaseStart] = useState('2025-01-01');
  const [leaseEnd, setLeaseEnd] = useState('2026-12-31');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const propertyUnits = units.filter(u => u.propertyId === selectedPropertyId && u.status === 'Vacant');

  const filteredTenants = tenants.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.phone.toLowerCase().includes(q) ||
      t.unitNumber.toLowerCase().includes(q) ||
      t.propertyName.toLowerCase().includes(q) ||
      (t.lastMpesaReceipt && t.lastMpesaReceipt.toLowerCase().includes(q))
    );
  });

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !selectedUnitId) return;

    const prop = properties.find(p => p.id === selectedPropertyId);
    const unit = units.find(u => u.id === selectedUnitId);

    addTenant({
      name,
      email,
      phone: phone || '+254 700 000 000',
      propertyId: selectedPropertyId,
      propertyName: prop?.name || 'Property',
      unitId: selectedUnitId,
      unitNumber: unit?.unitNumber || '101',
      leaseStart,
      leaseEnd,
      rentAmount: unit?.rentAmount || 75000,
      rentStatus: 'Paid',
      emergencyContact: emergencyName ? {
        name: emergencyName,
        relation: 'Contact',
        phone: emergencyPhone
      } : undefined
    });

    setName('');
    setEmail('');
    setPhone('');
    setIsAddTenantOpen(false);
  };

  const paymentBadges = {
    Paid: 'bg-[#F2F6F2] text-[#4A5D4A]',
    Pending: 'bg-[#FAF4EB] text-[#C28B38]',
    Overdue: 'bg-[#FBF1EE] text-[#D17A5E]',
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-serif text-[#2C362C] tracking-tight">
              Resident Directory
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-[#F5F2EC] text-[#4A5D4A]">
              {tenants.length} Active Leases
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8C8880] mt-0.5">
            Contact information, M-Pesa rent payment status, and linked breakage tickets across Nairobi.
          </p>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-2.5">
          <button
            onClick={exportTenantsCSV}
            title="Download CSV export of tenant registry"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#F5F2EC] text-[#2C362C] border border-[#EDE8DF] text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5 text-[#5A6D5A]" />
            <span className="hidden sm:inline">Export Directory CSV</span>
          </button>

          <button
            id="tenants-add-tenant-btn"
            onClick={() => setIsAddTenantOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#5A6D5A] hover:bg-[#4D5E4D] text-white text-xs sm:text-sm font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resident</span>
          </button>
        </div>
      </div>

      {/* Add Tenant Modal / Drawer */}
      {isAddTenantOpen && (
        <form onSubmit={handleCreateTenant} className="p-6 rounded-[28px] bg-white border border-[#EDE8DF] shadow-lg space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-[#F5F2EC]">
            <h3 className="font-serif font-bold text-lg text-[#2C362C]">
              New Resident Lease & M-Pesa Assignment
            </h3>
            <button
              type="button"
              onClick={() => setIsAddTenantOpen(false)}
              className="text-xs text-[#8C8880] hover:text-[#2C362C]"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-[#8C8880] mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Juma Ochieng"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-xs rounded-xl border border-[#EDE8DF] bg-[#FAF8F5] text-[#2C362C] px-3 py-2 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8C8880] mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="resident@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full text-xs rounded-xl border border-[#EDE8DF] bg-[#FAF8F5] text-[#2C362C] px-3 py-2 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8C8880] mb-1">Phone Number (+254) *</label>
              <input
                type="tel"
                required
                placeholder="+254 712 345 678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full text-xs rounded-xl border border-[#EDE8DF] bg-[#FAF8F5] text-[#2C362C] px-3 py-2 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8C8880] mb-1">Estate Building *</label>
              <select
                value={selectedPropertyId}
                onChange={e => {
                  setSelectedPropertyId(e.target.value);
                  setSelectedUnitId('');
                }}
                className="w-full text-xs rounded-xl border border-[#EDE8DF] bg-[#FAF8F5] text-[#2C362C] px-3 py-2 focus:bg-white focus:outline-none"
              >
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8C8880] mb-1">Unit Assignment *</label>
              <select
                required
                value={selectedUnitId}
                onChange={e => setSelectedUnitId(e.target.value)}
                className="w-full text-xs rounded-xl border border-[#EDE8DF] bg-[#FAF8F5] text-[#2C362C] px-3 py-2 focus:bg-white focus:outline-none"
              >
                <option value="">Select Apartment Unit</option>
                {units.filter(u => u.propertyId === selectedPropertyId).map(u => (
                  <option key={u.id} value={u.id}>Unit {u.unitNumber} ({u.status})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8C8880] mb-1">Lease End Date</label>
              <input
                type="date"
                value={leaseEnd}
                onChange={e => setLeaseEnd(e.target.value)}
                className="w-full text-xs rounded-xl border border-[#EDE8DF] bg-[#FAF8F5] text-[#2C362C] px-3 py-2 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddTenantOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs text-[#8C8880] hover:bg-[#F5F2EC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#5A6D5A] hover:bg-[#4D5E4D] text-white shadow-xs"
            >
              Create Lease
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="p-3.5 rounded-2xl glass-card border border-white/80 flex items-center">
        <Search className="w-4 h-4 text-[#8C8880] ml-1 mr-3" />
        <input
          type="text"
          placeholder="Search by resident name, unit #, estate, phone, or M-Pesa receipt ref..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full text-xs sm:text-sm bg-transparent text-[#2C362C] placeholder-[#8C8880] focus:outline-hidden"
        />
      </div>

      {/* Residents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTenants.map(tenant => {
          const tenantRequests = maintenanceRequests.filter(r => r.unitId === tenant.unitId && r.status !== 'Resolved');
          return (
            <div
              key={tenant.id}
              className="p-5 rounded-[24px] glass-card glass-card-hover border border-white/80 transition space-y-3.5"
            >
              {/* Header: Avatar & Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {tenant.avatarUrl ? (
                    <img
                      src={tenant.avatarUrl}
                      alt={tenant.name}
                      className="w-11 h-11 rounded-full object-cover border border-[#EDE8DF]"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[#EAE5DC] flex items-center justify-center font-bold text-xs text-[#2C362C]">
                      {tenant.name[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-sm text-[#2C362C]">
                      {tenant.name}
                    </h3>
                    <p className="text-[11px] text-[#8C8880]">
                      {tenant.propertyName} • Unit {tenant.unitNumber}
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${paymentBadges[tenant.rentStatus]}`}>
                  {tenant.rentStatus}
                </span>
              </div>

              {/* Contact Information */}
              <div className="space-y-1.5 text-xs text-[#4A4844] pt-1">
                <div className="flex items-center space-x-2 text-[11px]">
                  <Mail className="w-3.5 h-3.5 text-[#8C8880]" />
                  <span className="truncate">{tenant.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px]">
                  <Phone className="w-3.5 h-3.5 text-[#8C8880]" />
                  <span>{tenant.phone}</span>
                </div>
                {tenant.lastMpesaReceipt && (
                  <div className="flex items-center space-x-2 text-[11px] text-[#4A5D4A]">
                    <CreditCard className="w-3.5 h-3.5 text-[#4A5D4A]" />
                    <span>M-Pesa Ref: <strong className="font-mono">{tenant.lastMpesaReceipt}</strong></span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-[#8C8880]" />
                  <span>Lease: {new Date(tenant.leaseStart).toLocaleDateString([], { month: 'short', year: 'numeric' })} – {new Date(tenant.leaseEnd).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Footer: Rent in KSh & QR */}
              <div className="pt-3 border-t border-[#F5F2EC] flex items-center justify-between">
                <span className="font-serif font-bold text-xs text-[#2C362C]">
                  {formatKsh(tenant.rentAmount)} <span className="text-[10px] font-normal text-[#8C8880]">/mo</span>
                </span>

                <div className="flex items-center space-x-2">
                  {tenantRequests.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedRequestId(tenantRequests[0].id);
                        setActiveTab('maintenance');
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-[#FBF1EE] text-[#D17A5E] hover:bg-[#F5D8CF] transition"
                    >
                      {tenantRequests.length} Ticket{tenantRequests.length > 1 ? 's' : ''}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setTenantLinkUnitId(tenant.unitId);
                      setIsTenantLinkModalOpen(true);
                    }}
                    title="Generate QR code for this unit"
                    className="p-1.5 text-[#8C8880] hover:text-[#2C362C] rounded-lg transition"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
