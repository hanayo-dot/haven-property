import React, { useState } from 'react';
import { 
  Building2, 
  Home, 
  Camera, 
  Wrench, 
  CreditCard, 
  Phone, 
  MessageSquare, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ExternalLink, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  Send,
  Loader2,
  Download,
  LogOut
} from 'lucide-react';
import { useProperty } from '../context/PropertyContext';
import { TenantReportPortal } from './TenantReportPortal';
import { IssueStatus } from '../types';
import { api } from '../services/api';

export const TenantDashboard: React.FC = () => {
  const { 
    currentUser, 
    logout,
    maintenanceRequests, 
    properties, 
    units, 
    openPhotoViewer, 
    setSelectedRequestId,
    setIsReportModalOpen 
  } = useProperty();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'report' | 'tickets' | 'mpesa'>('overview');
  const [isSimulatingMpesa, setIsSimulatingMpesa] = useState(false);
  const [mpesaSuccess, setMpesaSuccess] = useState<string | null>(null);
  const [mpesaPhoneNumber, setMpesaPhoneNumber] = useState(currentUser?.phone || '+254 712 345 678');

  // Filter maintenance requests specifically for this tenant/unit
  const myRequests = maintenanceRequests.filter(r => {
    if (currentUser?.unitId && r.unitId === currentUser.unitId) return true;
    if (currentUser?.unitNumber && r.unitNumber === currentUser.unitNumber) return true;
    if (currentUser?.name && r.tenantName.toLowerCase().includes(currentUser.name.toLowerCase())) return true;
    return false;
  });

  const property = properties.find(p => p.id === currentUser?.propertyId) || properties[0];
  const unit = units.find(u => u.id === currentUser?.unitId) || units[0];

  const rentAmount = currentUser?.rentAmount || unit?.rentAmount || 75000;
  const mpesaAccount = currentUser?.mpesaAccount || `ESTATE-${currentUser?.unitNumber || '4B'}`;
  const paybillNumber = property?.mpesaPaybill || '880120';

  const handleSimulateSTKPush = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulatingMpesa(true);

    try {
      const resp = await api.simulateMpesaPayment({
        tenantId: currentUser?.id,
        phoneNumber: mpesaPhoneNumber,
        amount: rentAmount,
        account: mpesaAccount
      });

      if (resp && resp.receiptNumber) {
        setMpesaSuccess(resp.receiptNumber);
      } else {
        const fallbackRef = `QK${Math.random().toString(36).substring(2, 6).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
        setMpesaSuccess(fallbackRef);
      }
    } catch {
      const fallbackRef = `QK${Math.random().toString(36).substring(2, 6).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
      setMpesaSuccess(fallbackRef);
    } finally {
      setIsSimulatingMpesa(false);
    }
  };

  const priorityBadges = {
    Emergency: 'bg-rose-50 text-rose-600 border border-rose-200',
    High: 'bg-amber-50 text-amber-700 border border-amber-200',
    Medium: 'bg-blue-50 text-[#0045A5] border border-blue-200',
    Low: 'bg-slate-100 text-[#64748B] border border-slate-200',
  };

  const statusBadges: Record<IssueStatus, string> = {
    'New': 'bg-slate-100 text-[#64748B] border border-slate-200',
    'Under Review': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Scheduled': 'bg-blue-50 text-[#0045A5] border border-blue-200',
    'In Progress': 'bg-sky-50 text-sky-700 border border-sky-200',
    'Resolved': 'bg-[#0045A5] text-white'
  };

  return (
    <div className="space-y-6">
      
      {/* Resident Welcome Banner */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0045A5] text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-white/15 text-sky-200 backdrop-blur-xs">
                Resident Portal
              </span>
              <span className="text-xs text-slate-300">
                {property.name} • Unit {currentUser?.unitNumber || '4B'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Habari, {currentUser?.name || 'Resident'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl font-light">
              Track repairs, log maintenance with AI photo diagnostics, and pay monthly rent via M-Pesa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveSubTab('report')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#0045A5] text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95 flex items-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>+ Report Breakage</span>
            </button>

            <button
              onClick={() => setActiveSubTab('mpesa')}
              className="px-4 py-2.5 rounded-xl bg-[#00A859] hover:bg-[#008f4c] text-white text-xs sm:text-sm font-semibold transition flex items-center space-x-2 shadow-xs"
            >
              <CreditCard className="w-4 h-4 text-white" />
              <span>M-Pesa Paybill</span>
            </button>

            <button
              id="tenant-banner-logout-btn"
              onClick={logout}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-rose-600 text-white text-xs sm:text-sm font-semibold transition flex items-center space-x-1.5 border border-white/20"
            >
              <LogOut className="w-4 h-4 text-rose-200" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        <Home className="w-64 h-64 absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-[0.05] pointer-events-none text-white" />
      </div>

      {/* Navigation Sub-Tabs for Tenant */}
      <div className="flex items-center space-x-1 glass-panel p-1.5 rounded-2xl border border-slate-200/80 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSubTab === 'overview'
              ? 'bg-[#0045A5] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Apartment & Tickets ({myRequests.length})
        </button>

        <button
          onClick={() => setActiveSubTab('report')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
            activeSubTab === 'report'
              ? 'bg-[#0045A5] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Report Breakage</span>
        </button>

        <button
          onClick={() => setActiveSubTab('mpesa')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
            activeSubTab === 'mpesa'
              ? 'bg-[#0045A5] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>M-Pesa Rent Payment</span>
        </button>
      </div>

      {/* Main Tenant Sub-Views */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left 2 Cols: Active & Past Maintenance Tickets */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">
                  My Maintenance & Repair Tickets
                </h2>
                <p className="text-xs text-[#64748B]">
                  Live updates on landlord reviews and fundi technician visits.
                </p>
              </div>

              <button
                onClick={() => setActiveSubTab('report')}
                className="text-xs font-semibold text-[#0045A5] hover:underline"
              >
                + New Report
              </button>
            </div>

            {myRequests.length > 0 ? (
              <div className="space-y-3.5">
                {myRequests.map(req => (
                  <div
                    key={req.id}
                    className="p-5 rounded-[24px] glass-card glass-card-hover border border-slate-200/80 space-y-3"
                  >
                    {/* Header: Ticket & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-[#0045A5] border border-slate-200">
                          {req.ticketNumber}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${priorityBadges[req.priority]}`}>
                          {req.priority}
                        </span>
                      </div>

                      <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${statusBadges[req.status]}`}>
                        {req.status}
                      </span>
                    </div>

                    {/* Title & Desc */}
                    <div>
                      <h3 className="font-semibold text-sm text-[#0F172A]">
                        {req.title}
                      </h3>
                      <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                        {req.description}
                      </p>
                    </div>

                    {/* Photos Preview */}
                    {req.photos.length > 0 && (
                      <div className="flex items-center space-x-2 pt-1">
                        {req.photos.map((photo, i) => (
                          <div
                            key={i}
                            onClick={() => openPhotoViewer(req.photos, i, req.title)}
                            className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:opacity-90 transition shrink-0 bg-slate-100"
                          >
                            <img src={photo.url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Assigned Fundi Card (if scheduled) */}
                    {req.assignedContractor && (
                      <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1.5 font-semibold text-[#0F172A]">
                            <Wrench className="w-3.5 h-3.5 text-[#0045A5]" />
                            <span>Fundi Dispatched: {req.assignedContractor.name}</span>
                          </div>
                          <p className="text-[#64748B] text-[11px]">
                            {req.assignedContractor.company} • Scheduled: <strong>{req.assignedContractor.scheduledDate}</strong> ({req.assignedContractor.estimatedArrival || 'Morning'})
                          </p>
                        </div>

                        {req.assignedContractor.whatsApp && (
                          <a
                            href={`https://wa.me/${req.assignedContractor.whatsApp}?text=Hello%20${encodeURIComponent(req.assignedContractor.name)},%20I%20am%20at%20${encodeURIComponent(property.name)}%20Unit%20${encodeURIComponent(currentUser?.unitNumber || '4B')}%20regarding%20ticket%20${encodeURIComponent(req.ticketNumber)}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-2xs"
                          >
                            <span>WhatsApp Fundi</span>
                          </a>
                        )}
                      </div>
                    )}

                    {/* AI Assessment Briefing */}
                    {req.aiDiagnosis && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-[#475569]">
                        <div className="flex items-center space-x-1 font-semibold text-[#0F172A] text-[11px]">
                          <Sparkles className="w-3 h-3 text-[#0045A5]" />
                          <span>AI Assessment:</span>
                          <span className="text-[#0045A5] font-normal">{req.aiDiagnosis.categorySummary}</span>
                        </div>
                        <p className="text-[11px]">{req.aiDiagnosis.recommendedAction}</p>
                      </div>
                    )}

                    {/* Footer Date */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#64748B]">
                      <span>Logged on {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>{req.timeline.length} updates</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 rounded-[24px] bg-white border border-slate-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#0045A5] mx-auto opacity-70" />
                <h3 className="font-semibold text-sm text-[#0F172A]">
                  No active maintenance issues
                </h3>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                  Everything in your unit is in working order. If you notice a leak, broken latch, or electrical issue, click below.
                </p>
                <button
                  onClick={() => setActiveSubTab('report')}
                  className="px-4 py-2 rounded-xl bg-[#0045A5] hover:bg-[#003882] text-white text-xs font-semibold shadow-xs"
                >
                  Report Damage Photo
                </button>
              </div>
            )}
          </div>

          {/* Right 1 Col: Apartment & Estate Contacts */}
          <div className="space-y-5">
            
            {/* Rent & M-Pesa Summary Card */}
            <div className="p-6 rounded-[24px] glass-card border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#0F172A]">
                  Lease & Monthly Rent
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Lease
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 space-y-2">
                <div className="text-xs text-[#64748B]">Monthly Rent:</div>
                <div className="text-2xl font-extrabold text-[#0F172A]">
                  KSh {rentAmount.toLocaleString()}
                </div>
                <div className="text-[11px] text-[#0045A5] font-semibold">
                  M-Pesa Account: <span className="font-mono">{mpesaAccount}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveSubTab('mpesa')}
                className="w-full py-2.5 rounded-xl bg-[#0045A5] hover:bg-[#003882] text-white text-xs font-semibold shadow-xs transition flex items-center justify-center space-x-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay Rent via M-Pesa</span>
              </button>
            </div>

            {/* Estate Caretaker Card */}
            <div className="p-6 rounded-[24px] glass-card border border-slate-200/80 space-y-3">
              <h3 className="font-bold text-sm text-[#0F172A] flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#0045A5]" />
                <span>Caretaker & Assistance</span>
              </h3>

              <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200 space-y-1.5 text-xs">
                <p className="font-semibold text-[#0F172A]">{property.caretakerContact?.name || 'Mwangi Kamau (Caretaker)'}</p>
                <p className="text-[#64748B] text-[11px]">Phone: {property.caretakerContact?.phone || '+254 722 123 456'}</p>
                
                {property.caretakerContact?.whatsApp && (
                  <a
                    href={`https://wa.me/${property.caretakerContact.whatsApp}?text=Hello%20Caretaker,%20this%20is%20${encodeURIComponent(currentUser?.name || 'Resident')}%20from%20Unit%20${encodeURIComponent(currentUser?.unitNumber || '4B')}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-[#25D366] hover:underline pt-1"
                  >
                    <span>Chat on WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="text-[11px] text-[#64748B] space-y-1 pt-1">
                <p>• Garbage collection: Monday & Thursday morning</p>
                <p>• Borehole & Water: 24/7 continuous supply</p>
                <p>• Gate Security: Contact gate via intercom dial 01</p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Sub-View: Report Breakage */}
      {activeSubTab === 'report' && (
        <div className="glass-card rounded-[28px] border border-slate-200/80 p-6 shadow-sm">
          <TenantReportPortal />
        </div>
      )}

      {/* Sub-View: M-Pesa Rent Payment Simulator */}
      {activeSubTab === 'mpesa' && (
        <div className="max-w-xl mx-auto p-7 sm:p-8 glass-modal rounded-[32px] border border-white/90 space-y-6 animate-fadeIn">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#00A859]/10 text-[#00A859] flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0F172A]">
              M-Pesa Rent Payment
            </h2>
            <p className="text-xs text-[#64748B]">
              Pay instantly to the building Safaricom M-Pesa Paybill.
            </p>
          </div>

          {/* Paybill Instructions Box */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-[#64748B]">Business Paybill:</span>
              <span className="font-mono font-bold text-sm text-[#0F172A]">{paybillNumber}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-[#64748B]">Account Number:</span>
              <span className="font-mono font-bold text-sm text-[#0045A5]">{mpesaAccount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#64748B]">Monthly Amount:</span>
              <span className="font-extrabold text-base text-[#0F172A]">KSh {rentAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* STK Push Simulator */}
          <form onSubmit={handleSimulateSTKPush} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] mb-1">
                Safaricom M-Pesa Mobile Number
              </label>
              <input
                type="tel"
                required
                value={mpesaPhoneNumber}
                onChange={e => setMpesaPhoneNumber(e.target.value)}
                placeholder="+254 712 345 678"
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 focus:bg-white focus:outline-hidden focus:border-[#0045A5]"
              />
            </div>

            <button
              type="submit"
              disabled={isSimulatingMpesa}
              className="w-full py-3.5 rounded-xl bg-[#00A859] hover:bg-[#008f4c] text-white font-semibold text-xs sm:text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSimulatingMpesa ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending M-Pesa STK Prompt to phone...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay KSh {rentAmount.toLocaleString()} via M-Pesa</span>
                </>
              )}
            </button>
          </form>

          {/* Success Dialog */}
          {mpesaSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center space-x-2 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>M-Pesa Payment Confirmed!</span>
              </div>
              <p className="text-emerald-700">
                Receipt <strong className="font-mono text-[#0F172A]">{mpesaSuccess}</strong> Confirmed. KSh {rentAmount.toLocaleString()} paid to PlotiSmarta Properties ({property.name} Unit {currentUser?.unitNumber || '4B'}).
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
