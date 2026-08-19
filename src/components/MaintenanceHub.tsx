import React, { useState } from 'react';
import { 
  Wrench, 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  Building2, 
  Home, 
  User, 
  CheckCircle2, 
  Truck, 
  Sparkles, 
  ExternalLink, 
  ChevronRight, 
  Columns3, 
  ListFilter, 
  PlusCircle, 
  Eye, 
  Camera, 
  Calendar, 
  DollarSign,
  Download,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useProperty } from '../context/PropertyContext';
import { IssueCategory, IssuePriority, IssueStatus, MaintenanceRequest } from '../types';

export const MaintenanceHub: React.FC = () => {
  const { 
    maintenanceRequests, 
    properties, 
    setSelectedRequestId, 
    setIsReportModalOpen, 
    updateRequestStatus,
    openPhotoViewer,
    exportMaintenanceCSV,
    formatKsh,
    stats 
  } = useProperty();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [viewLayout, setViewLayout] = useState<'kanban' | 'list'>('kanban');

  // Filtered requests
  const filteredRequests = maintenanceRequests.filter(req => {
    if (selectedStatus !== 'all' && req.status !== selectedStatus) return false;
    if (selectedCategory !== 'all' && req.category !== selectedCategory) return false;
    if (selectedPriority !== 'all' && req.priority !== selectedPriority) return false;
    if (selectedProperty !== 'all' && req.propertyId !== selectedProperty) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = req.title.toLowerCase().includes(q);
      const matchDesc = req.description.toLowerCase().includes(q);
      const matchTenant = req.tenantName.toLowerCase().includes(q);
      const matchUnit = req.unitNumber.toLowerCase().includes(q);
      const matchTicket = req.ticketNumber.toLowerCase().includes(q);
      const matchProp = req.propertyName.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchTenant || matchUnit || matchTicket || matchProp;
    }

    return true;
  });

  const priorityBadges = {
    Emergency: 'bg-rose-50 text-rose-600 border border-rose-200',
    High: 'bg-amber-50 text-amber-700 border border-amber-200',
    Medium: 'bg-blue-50 text-[#0045A5] border border-blue-200',
    Low: 'bg-slate-100 text-[#64748B] border border-slate-200',
  };

  const statusColumns: { id: IssueStatus; label: string; icon: string; accentColor: string }[] = [
    { id: 'New', label: 'New', icon: '📥', accentColor: 'bg-slate-500' },
    { id: 'Under Review', label: 'Under Review', icon: '🔍', accentColor: 'bg-amber-500' },
    { id: 'Scheduled', label: 'Scheduled', icon: '🗓️', accentColor: 'bg-blue-600' },
    { id: 'In Progress', label: 'In Progress', icon: '⚡', accentColor: 'bg-sky-500' },
    { id: 'Resolved', label: 'Resolved', icon: '✅', accentColor: 'bg-[#0045A5]' },
  ];

  const hasActiveFilters = selectedCategory !== 'all' || selectedPriority !== 'all' || selectedProperty !== 'all' || searchQuery.trim() !== '';

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedPriority('all');
    setSelectedProperty('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Main Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Maintenance & Fundi Dispatch
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-50 text-[#0045A5] border border-blue-200">
              {filteredRequests.length} Tickets
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Damage photos, AI repair assessment (KSh), and WhatsApp fundi dispatch across Nairobi.
          </p>
        </div>

        {/* View mode toggle & quick report */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewLayout('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                viewLayout === 'kanban'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
              title="Kanban Board View"
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewLayout('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                viewLayout === 'list'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
              title="List View"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <button
            onClick={exportMaintenanceCSV}
            title="Download CSV export of all maintenance records"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] border border-slate-200 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5 text-[#0045A5]" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            id="maintenance-hub-new-report-btn"
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#0045A5] hover:bg-[#003882] text-white text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Report Breakage</span>
          </button>
        </div>
      </div>

      {/* Emergency Alert Banner (if any emergency exists) */}
      {stats.emergencyIssues > 0 && (
        <div className="p-4 rounded-[20px] bg-rose-50 border border-rose-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-rose-700">
                {stats.emergencyIssues} Emergency Ticket{stats.emergencyIssues > 1 ? 's' : ''} Require Immediate Fundi Action
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Active water leak or electrical hazard reported with resident photos.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedPriority('Emergency')}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition"
          >
            Show Emergency
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-[24px] glass-card border border-slate-200/80 space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by ticket #, description, tenant name, or unit..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-hidden"
            />
          </div>

          {/* Category, Property, Priority Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedProperty}
              onChange={e => setSelectedProperty(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl glass-input text-[#0F172A] focus:outline-hidden"
            >
              <option value="all">All Properties</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl glass-input text-[#0F172A] focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Appliance">Appliance</option>
              <option value="HVAC / Climate">Solar & Heating</option>
              <option value="Structural & Windows">Structural & Windows</option>
              <option value="Locks & Security">Locks & Security</option>
              <option value="Pest Control">Pest Control</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl glass-input text-[#0F172A] focus:outline-hidden"
            >
              <option value="all">All Priorities</option>
              <option value="Emergency">🚨 Emergency</option>
              <option value="High">⚠️ High</option>
              <option value="Medium">⚡ Medium</option>
              <option value="Low">🌱 Routine</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="p-2 text-[#64748B] hover:text-rose-600 rounded-lg transition text-xs font-semibold flex items-center space-x-1"
                title="Clear all search and filters"
              >
                <X className="w-4 h-4" />
                <span className="hidden lg:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 no-scrollbar border-t border-slate-100">
          {['all', 'New', 'Under Review', 'Scheduled', 'In Progress', 'Resolved'].map(status => {
            const count = status === 'all' 
              ? maintenanceRequests.length 
              : maintenanceRequests.filter(r => r.status === status).length;
            const isSelected = selectedStatus === status;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
                  isSelected
                    ? 'bg-[#0045A5] text-white font-semibold shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
                }`}
              >
                {status === 'all' ? 'All Tickets' : status} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content: Kanban or List */}
      {viewLayout === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {statusColumns.map(col => {
            const columnRequests = filteredRequests.filter(r => r.status === col.id);
            return (
              <div 
                key={col.id} 
                className="rounded-[22px] glass-panel border border-slate-200/80 p-3 flex flex-col min-h-[480px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs">{col.icon}</span>
                    <h3 className="font-semibold text-xs text-[#0F172A]">
                      {col.label}
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#0045A5] border border-slate-200">
                    {columnRequests.length}
                  </span>
                </div>

                {/* Cards in this column */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[72vh] pr-0.5">
                  {columnRequests.map(request => (
                    <div
                      key={request.id}
                      onClick={() => setSelectedRequestId(request.id)}
                      className="group p-3.5 rounded-[18px] glass-card glass-card-hover border border-slate-200/80 transition cursor-pointer space-y-2"
                    >
                      {/* Card Top: Ticket # & Priority */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#64748B]">
                          {request.ticketNumber}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${priorityBadges[request.priority]}`}>
                          {request.priority}
                        </span>
                      </div>

                      {/* Property & Unit */}
                      <div className="text-xs text-[#64748B] truncate">
                        <span className="font-semibold text-[#0F172A]">Unit {request.unitNumber}</span> • {request.propertyName}
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-semibold text-[#0F172A] leading-snug line-clamp-2 group-hover:text-[#0045A5] transition">
                        {request.title}
                      </h4>

                      {/* Photo Thumbnail if attached */}
                      {request.photos && request.photos.length > 0 && (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            openPhotoViewer(request.photos, 0, `${request.ticketNumber}: ${request.title}`);
                          }}
                          className="relative rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200"
                        >
                          <img
                            src={request.photos[0].url}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute bottom-1 right-1 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded-md">
                            {request.photos.length} Photo{request.photos.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}

                      {/* Assigned Fundi / Time Info */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-[#64748B]">
                        <span className="truncate">{request.assignedContractor ? request.assignedContractor.name : request.tenantName}</span>
                        <span>{new Date(request.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  ))}

                  {columnRequests.length === 0 && (
                    <div className="py-12 text-center text-xs text-[#94A3B8] font-light">
                      No tickets
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-[22px] bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredRequests.map(req => (
              <div
                key={req.id}
                onClick={() => setSelectedRequestId(req.id)}
                className="p-4 sm:p-5 hover:bg-slate-50 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                  {req.photos[0] ? (
                    <img 
                      src={req.photos[0].url} 
                      alt="" 
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-[#64748B] shrink-0">
                      <Wrench className="w-4 h-4" />
                    </div>
                  )}

                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="font-mono text-[#64748B]">{req.ticketNumber}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${priorityBadges[req.priority]}`}>
                        {req.priority}
                      </span>
                      <span className="text-[#64748B]">
                        {req.propertyName} • Unit {req.unitNumber}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-[#0F172A] truncate">
                      {req.title}
                    </h3>

                    <p className="text-xs text-[#64748B] truncate">
                      Resident: {req.tenantName} • Fundi: {req.assignedContractor ? req.assignedContractor.name : 'Unassigned'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-[#0F172A]">
                    {req.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                </div>
              </div>
            ))}

            {filteredRequests.length === 0 && (
              <div className="py-16 text-center text-xs text-[#64748B]">
                No maintenance requests match the current filters.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
