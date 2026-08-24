import React from 'react';
import { 
  Building2, 
  Wrench, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  Sparkles, 
  PlusCircle, 
  QrCode, 
  Camera,
  Truck,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Phone
} from 'lucide-react';
import { useProperty } from '../context/PropertyContext';
import { StatsCard } from './StatsCard';

export const DashboardOverview: React.FC = () => {
  const { 
    properties, 
    units, 
    tenants, 
    maintenanceRequests, 
    stats, 
    formatKsh,
    setActiveTab, 
    setSelectedRequestId, 
    setSelectedPropertyId, 
    setIsReportModalOpen, 
    setIsNewPropertyModalOpen,
    setIsTenantLinkModalOpen,
    openPhotoViewer 
  } = useProperty();

  const recentRequests = maintenanceRequests.slice(0, 4);
  const emergencyRequests = maintenanceRequests.filter(r => r.priority === 'Emergency' && r.status !== 'Resolved');
  const scheduledRequests = maintenanceRequests.filter(r => r.status === 'Scheduled' || r.status === 'In Progress');

  const priorityBadges = {
    Emergency: 'bg-rose-50 text-rose-600 border border-rose-200',
    High: 'bg-amber-50 text-amber-700 border border-amber-200',
    Medium: 'bg-blue-50 text-[#0045A5] border border-blue-200',
    Low: 'bg-slate-100 text-[#64748B] border border-slate-200',
  };

  return (
    <div className="space-y-7">
      
      {/* Welcome Banner with Kenyan Property Portfolio */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0045A5] text-white p-7 sm:p-9 shadow-[0_12px_36px_rgba(0,69,165,0.15)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2.5">
              <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-white/10 text-sky-200 backdrop-blur-xs">
                Nairobi Portfolio Intelligence
              </span>
              <span className="text-xs text-slate-300">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              PlotiSmarta Operations Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
              Managing <strong className="text-white font-semibold">{stats.totalProperties} properties</strong> ({stats.totalUnits} units across Kilimani, Westlands, and Kileleshwa) with live M-Pesa tracking, Gemini AI photo triage, and fundi dispatching.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="dash-report-breakage-btn"
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#0045A5] hover:bg-[#003882] text-white text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95 flex items-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>Report Breakage</span>
            </button>

            <button
              id="dash-qr-modal-btn"
              onClick={() => setIsTenantLinkModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-medium transition flex items-center space-x-2 border border-white/20"
            >
              <QrCode className="w-4 h-4 text-sky-200" />
              <span>Tenant QR</span>
            </button>

            <button
              id="dash-add-prop-btn"
              onClick={() => setIsNewPropertyModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs sm:text-sm font-semibold shadow-xs transition flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Add Property</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-10 pointer-events-none">
          <Building2 className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* Emergency Alert Callout (if active) */}
      {emergencyRequests.length > 0 && (
        <div className="p-4 sm:p-5 rounded-[24px] bg-rose-50 border border-rose-200 text-[#0F172A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                  Urgent Emergency Ticket
                </span>
                <span className="text-xs font-mono font-semibold bg-rose-100 px-2 py-0.5 rounded text-rose-800">
                  {emergencyRequests[0].ticketNumber}
                </span>
              </div>
              <h3 className="font-semibold text-sm text-[#0F172A] mt-0.5">
                {emergencyRequests[0].propertyName} (Unit {emergencyRequests[0].unitNumber}): {emergencyRequests[0].title}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            {emergencyRequests[0].photos.length > 0 && (
              <button
                onClick={() => openPhotoViewer(emergencyRequests[0].photos, 0, emergencyRequests[0].title)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#0F172A] border border-slate-200 text-xs font-medium transition"
              >
                Inspect Photos ({emergencyRequests[0].photos.length})
              </button>
            )}
            <button
              onClick={() => {
                setSelectedRequestId(emergencyRequests[0].id);
                setActiveTab('maintenance');
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition"
            >
              Dispatch Fundi
            </button>
          </div>
        </div>
      )}

      {/* 4 Key Metric Stats in Kenyan Shillings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          id="stat-monthly-revenue"
          title="Monthly Rent Revenue"
          value={formatKsh(stats.monthlyRevenue)}
          subtitle={`From ${stats.occupiedUnits} active tenant leases`}
          icon={DollarSign}
          accentColor="emerald"
          trend={{ text: 'M-Pesa Collections Active', isPositive: true }}
          onClick={() => setActiveTab('properties')}
        />

        <StatsCard
          id="stat-occupancy"
          title="Portfolio Occupancy"
          value={`${stats.occupancyRate}%`}
          subtitle={`${stats.occupiedUnits} of ${stats.totalUnits} units occupied`}
          icon={Building2}
          accentColor="blue"
          trend={{ text: `${stats.totalUnits - stats.occupiedUnits} vacant unit`, isPositive: stats.occupancyRate >= 90 }}
          onClick={() => setActiveTab('properties')}
        />

        <StatsCard
          id="stat-open-maintenance"
          title="Maintenance Tickets"
          value={stats.openIssues}
          subtitle={`${stats.emergencyIssues} emergency, ${stats.scheduledIssues} scheduled`}
          icon={Wrench}
          accentColor={stats.emergencyIssues > 0 ? 'red' : 'amber'}
          trend={{ text: stats.emergencyIssues > 0 ? 'Action required' : 'Fundis dispatched', isPositive: stats.emergencyIssues === 0 }}
          onClick={() => setActiveTab('maintenance')}
        />

        <StatsCard
          id="stat-total-tenants"
          title="Active Residents"
          value={tenants.length}
          subtitle="All M-Pesa accounts linked"
          icon={Users}
          accentColor="purple"
          trend={{ text: 'All leases active', isPositive: true }}
          onClick={() => setActiveTab('tenants')}
        />
      </div>

      {/* Two Column Layout: Recent Damage Reports & Property Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Cols: Recent Breakage Reports */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A]">
                Recent Breakage Reports & AI Triage
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Real-time damage photo evidence, Gemini cost estimates (KSh), and fundi assignments.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('maintenance')}
              className="text-xs font-semibold text-[#0045A5] hover:underline flex items-center space-x-1"
            >
              <span>View All ({maintenanceRequests.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentRequests.map(req => (
              <div
                key={req.id}
                onClick={() => {
                  setSelectedRequestId(req.id);
                  setActiveTab('maintenance');
                }}
                className="group p-4 sm:p-5 rounded-[22px] glass-card glass-card-hover border border-slate-200/80 transition cursor-pointer flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
              >
                {/* Photo and Details */}
                <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                  {/* Photo thumbnail */}
                  {req.photos[0] ? (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        openPhotoViewer(req.photos, 0, `${req.ticketNumber}: ${req.title}`);
                      }}
                      className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0 group/img bg-slate-100"
                    >
                      <img src={req.photos[0].url} alt="" className="w-full h-full object-cover group-hover/img:scale-110 transition duration-300" />
                      <div className="absolute inset-0 bg-black/20 group-hover/img:bg-transparent flex items-end p-1">
                        <span className="text-[8px] font-bold text-white bg-black/70 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Camera className="w-2.5 h-2.5" />
                          <span>{req.photos.length}</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#64748B] shrink-0">
                      <Wrench className="w-5 h-5" />
                    </div>
                  )}

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono text-[#64748B]">
                        {req.ticketNumber}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${priorityBadges[req.priority]}`}>
                        {req.priority}
                      </span>
                      <span className="text-xs font-semibold text-[#0F172A] truncate">
                        {req.propertyName} • Unit {req.unitNumber}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-[#0F172A] truncate group-hover:text-[#0045A5] transition">
                      {req.title}
                    </h3>

                    <div className="text-[11px] text-[#64748B] flex items-center space-x-2 pt-0.5">
                      <span>Resident: {req.tenantName}</span>
                      <span>•</span>
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Status & CTA */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-[#334155]">
                    {req.status}
                  </span>
                  <span className="text-xs text-[#0045A5] font-semibold flex items-center space-x-0.5">
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Properties Snapshot & Active Fundi Dispatches */}
        <div className="space-y-5">
          
          {/* Properties Snapshot in Nairobi */}
          <div className="p-6 rounded-[24px] glass-card border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0F172A] flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-[#0045A5]" />
                <span>Nairobi Estates</span>
              </h3>
              <button
                onClick={() => setActiveTab('properties')}
                className="text-xs text-[#0045A5] font-semibold hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3">
              {properties.map(property => {
                const propUnits = units.filter(u => u.propertyId === property.id);
                const occupied = propUnits.filter(u => u.status === 'Occupied').length;
                const total = propUnits.length || 1;
                const percent = Math.round((occupied / total) * 100);
                const openReqs = maintenanceRequests.filter(r => r.propertyId === property.id && r.status !== 'Resolved').length;

                return (
                  <div
                    key={property.id}
                    onClick={() => {
                      setSelectedPropertyId(property.id);
                      setActiveTab('properties');
                    }}
                    className="p-3.5 rounded-xl bg-white/70 border border-slate-200/80 hover:border-[#0045A5]/40 transition cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-[#0F172A] truncate max-w-[180px]">
                        {property.name}
                      </h4>
                      {openReqs > 0 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          {openReqs} open
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                        <span>{occupied} of {total} Units Occupied</span>
                        <span className="font-semibold text-[#0F172A]">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#0045A5] h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scheduled Fundi Visits Card */}
          <div className="p-6 rounded-[24px] glass-card border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0F172A] flex items-center space-x-2">
                <Truck className="w-4 h-4 text-[#0045A5]" />
                <span>Scheduled Fundi Dispatches</span>
              </h3>
            </div>

            {scheduledRequests.length > 0 ? (
              <div className="space-y-2.5">
                {scheduledRequests.map(req => (
                  <div 
                    key={req.id}
                    onClick={() => {
                      setSelectedRequestId(req.id);
                      setActiveTab('maintenance');
                    }}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1 cursor-pointer hover:bg-slate-100 transition"
                  >
                    <div className="flex items-center justify-between font-semibold text-[#0F172A]">
                      <span>{req.assignedContractor?.name || 'Fundi on call'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#0045A5] border border-blue-200 font-semibold">
                        {req.assignedContractor?.scheduledDate || 'Today'}
                      </span>
                    </div>
                    <p className="text-[#64748B] truncate">
                      {req.propertyName} ({req.unitNumber}) - {req.title}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#64748B] py-3 text-center">
                No fundi visits currently scheduled.
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
