import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  Clock, 
  User, 
  Phone, 
  Building2, 
  Home, 
  Sparkles, 
  Wrench, 
  Trash2, 
  Truck, 
  MessageSquare,
  Copy,
  Check,
  Send,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { useProperty } from '../context/PropertyContext';
import { IssuePriority, IssueStatus } from '../types';

export const MaintenanceDetailModal: React.FC = () => {
  const { 
    selectedRequestId, 
    setSelectedRequestId, 
    maintenanceRequests, 
    updateRequestStatus, 
    updateRequestPriority,
    assignContractor,
    addTimelineEntry,
    deleteMaintenanceRequest,
    openPhotoViewer,
    formatKsh 
  } = useProperty();

  const [newComment, setNewComment] = useState('');
  const [contractorName, setContractorName] = useState('');
  const [contractorCompany, setContractorCompany] = useState('');
  const [contractorPhone, setContractorPhone] = useState('');
  const [contractorWhatsApp, setContractorWhatsApp] = useState('');
  const [contractorDate, setContractorDate] = useState('');
  const [contractorArrival, setContractorArrival] = useState('');
  const [contractorCost, setContractorCost] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [copiedBriefing, setCopiedBriefing] = useState(false);

  const request = maintenanceRequests.find(r => r.id === selectedRequestId);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedRequestId) {
        setSelectedRequestId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRequestId, setSelectedRequestId]);

  if (!selectedRequestId || !request) return null;

  const handleStatusChange = (newStatus: IssueStatus) => {
    updateRequestStatus(request.id, newStatus);
  };

  const handlePriorityChange = (newPriority: IssuePriority) => {
    updateRequestPriority(request.id, newPriority);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    addTimelineEntry(request.id, {
      author: 'Eleanor Wanjiku (Landlord)',
      role: 'landlord',
      title: 'Landlord Update to Resident',
      description: newComment.trim(),
      type: 'comment'
    });
    setNewComment('');
  };

  const handleSaveContractor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractorName || !contractorCompany) return;

    const cleanWa = contractorWhatsApp.replace(/[^0-9]/g, '') || contractorPhone.replace(/[^0-9]/g, '');

    assignContractor(
      request.id,
      {
        name: contractorName,
        company: contractorCompany,
        phone: contractorPhone || '+254 700 000 000',
        whatsApp: cleanWa,
        scheduledDate: contractorDate || new Date().toISOString().split('T')[0],
        estimatedArrival: contractorArrival || 'Morning (9:00 AM - 12:00 PM)'
      },
      contractorCost ? parseFloat(contractorCost) : undefined
    );

    setIsAssigning(false);
  };

  const generateDispatchBriefing = () => {
    return `*PLOTISMARTA DISPATCH ORDER*\n` +
      `Ticket: ${request.ticketNumber}\n` +
      `Property: ${request.propertyName}\n` +
      `Unit: ${request.unitNumber}\n` +
      `Issue: ${request.title}\n` +
      `Priority: ${request.priority}\n` +
      `Tenant: ${request.tenantName} (${request.tenantPhone})\n` +
      `Entry: ${request.entryPermission ? 'Authorized to enter' : 'Tenant present required'}\n` +
      `AI Diagnostic: ${request.aiDiagnosis?.categorySummary || request.description}\n` +
      `Estimated Cost: ${request.aiDiagnosis?.estimatedCostRange || 'TBD'}\n` +
      `Notes: ${request.description}`;
  };

  const handleCopyDispatch = async () => {
    try {
      await navigator.clipboard.writeText(generateDispatchBriefing());
      setCopiedBriefing(true);
      setTimeout(() => setCopiedBriefing(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const priorityBadges = {
    Emergency: 'bg-rose-50 text-rose-600 border border-rose-200',
    High: 'bg-amber-50 text-amber-700 border border-amber-200',
    Medium: 'bg-blue-50 text-[#0045A5] border border-blue-200',
    Low: 'bg-slate-100 text-[#64748B] border border-slate-200',
  };

  const whatsAppPhone = request.assignedContractor?.whatsApp || request.assignedContractor?.phone?.replace(/[^0-9]/g, '') || '';

  return (
    <div 
      id="maintenance-detail-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={() => setSelectedRequestId(null)}
      className="fixed inset-0 z-40 bg-[#0F172A]/50 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
    >
      <div 
        id="maintenance-detail-modal"
        onClick={e => e.stopPropagation()}
        className="glass-modal rounded-[32px] max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-[#0F172A] my-auto border border-white/90"
      >
        {/* Modal Top Bar */}
        <div className="sticky top-0 z-20 glass-header px-6 sm:px-8 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-[#0045A5] border border-slate-200">
              {request.ticketNumber}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${priorityBadges[request.priority]}`}>
              {request.priority} Priority
            </span>
            <span className="text-xs text-[#64748B] font-medium">
              {request.category}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* WhatsApp Direct Dispatch */}
            {whatsAppPhone && (
              <a
                href={`https://wa.me/${whatsAppPhone}?text=${encodeURIComponent(generateDispatchBriefing())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white transition shadow-2xs"
              >
                <span>WhatsApp Fundi</span>
              </a>
            )}

            <button
              onClick={handleCopyDispatch}
              title="Copy dispatch work order text"
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-[#0F172A] border border-slate-200 transition"
            >
              {copiedBriefing ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#64748B]" />
                  <span className="hidden sm:inline">Copy SMS</span>
                </>
              )}
            </button>

            <button
              id="close-maintenance-detail-btn"
              onClick={() => setSelectedRequestId(null)}
              aria-label="Close dialog"
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body - Clean 2 Column Grid */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Header Title & Property Breadcrumb */}
          <div className="space-y-1.5 pb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              {request.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748B]">
              <span className="font-semibold text-[#0F172A] flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-[#0045A5]" />
                <span>{request.propertyName}</span>
              </span>
              <span>•</span>
              <span className="font-semibold text-[#0F172A]">Unit {request.unitNumber}</span>
              <span>•</span>
              <span>Reported {new Date(request.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Photos + Description + Timeline (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Damage Photos Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Damage Photo Evidence ({request.photos.length})
                  </h3>
                  {request.photos.length > 0 && (
                    <button
                      onClick={() => openPhotoViewer(request.photos, 0, `${request.ticketNumber}: ${request.title}`)}
                      className="text-xs font-semibold text-[#0045A5] hover:underline flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Full-Screen</span>
                    </button>
                  )}
                </div>

                {request.photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {request.photos.map((photo, index) => (
                      <div
                        key={photo.id || index}
                        onClick={() => openPhotoViewer(request.photos, index, `${request.ticketNumber}: ${request.title}`)}
                        className="group relative rounded-2xl overflow-hidden aspect-square bg-slate-100 border border-slate-200 cursor-pointer shadow-xs hover:shadow-md transition duration-200"
                      >
                        <img
                          src={photo.url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {photo.tag && (
                          <span className="absolute top-2 left-2 text-[9px] font-semibold px-2 py-0.5 rounded-md bg-[#0F172A]/80 text-white backdrop-blur-xs">
                            {photo.tag}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-[#64748B]">
                    No photos attached.
                  </div>
                )}
              </div>

              {/* Description Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                  Resident Description
                </h4>
                <p className="text-xs sm:text-sm text-[#0F172A] leading-relaxed">
                  {request.description}
                </p>
                <div className="pt-2 text-[11px] text-[#64748B] flex items-center space-x-3">
                  <span>Resident: <strong className="text-[#0F172A]">{request.tenantName}</strong> ({request.tenantPhone})</span>
                  <span>•</span>
                  <span>Entry: {request.entryPermission ? 'Authorized' : 'Must be present'}</span>
                </div>
              </div>

              {/* Timeline & Notes */}
              <div className="space-y-3 pt-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center space-x-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#0045A5]" />
                  <span>Activity & Timeline</span>
                </h3>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {request.timeline.map(entry => (
                    <div 
                      key={entry.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#0F172A]">{entry.author}</span>
                        <span className="text-[#64748B]">
                          {new Date(entry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[#475569]">{entry.description}</p>
                    </div>
                  ))}
                </div>

                {/* Comment Input */}
                <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add fundi update or memo..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    className="flex-1 text-xs rounded-xl border border-slate-200 bg-white text-[#0F172A] px-3 py-2 focus:ring-2 focus:ring-[#0045A5]/30 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-[#0045A5] hover:bg-[#003882] text-white text-xs font-semibold shadow-xs transition"
                  >
                    Post
                  </button>
                </form>
              </div>

            </div>

            {/* Right Column: Actions + AI Diagnosis + Fundi Dispatch (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Quick Status Control */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                      Status
                    </label>
                    <select
                      value={request.status}
                      onChange={e => handleStatusChange(e.target.value as IssueStatus)}
                      className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white text-[#0F172A] px-2.5 py-2 focus:outline-hidden focus:border-[#0045A5]"
                    >
                      <option value="New">New</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                      Priority
                    </label>
                    <select
                      value={request.priority}
                      onChange={e => handlePriorityChange(e.target.value as IssuePriority)}
                      className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white text-[#0F172A] px-2.5 py-2 focus:outline-hidden focus:border-[#0045A5]"
                    >
                      <option value="Emergency">Emergency</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Routine</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => setIsAssigning(!isAssigning)}
                  className="w-full py-2 rounded-xl bg-[#0045A5] hover:bg-[#003882] text-white text-xs font-semibold shadow-xs transition flex items-center justify-center space-x-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{request.assignedContractor ? 'Edit Fundi Assignment' : 'Dispatch Fundi / Tech'}</span>
                </button>
              </div>

              {/* Gemini AI Diagnostic Assistant Card (in KSh) */}
              {request.aiDiagnosis && (
                <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 space-y-2.5">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#0045A5]" />
                    <h4 className="text-xs font-bold text-[#0F172A]">
                      Gemini AI Triage Assessment
                    </h4>
                  </div>

                  <p className="text-xs text-[#0F172A] font-semibold">
                    {request.aiDiagnosis.categorySummary}
                  </p>

                  <div className="pt-2 border-t border-blue-200 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[#64748B] block">Estimated Cost</span>
                      <strong className="text-[#0045A5] font-semibold">{request.aiDiagnosis.estimatedCostRange}</strong>
                    </div>
                    <div>
                      <span className="text-[#64748B] block">Suggested Fundi</span>
                      <strong className="text-[#0F172A]">{request.aiDiagnosis.suggestedTrade}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-blue-200 text-[11px] text-[#475569]">
                    <span className="font-semibold block text-[#0F172A] mb-0.5">Recommended Action:</span>
                    {request.aiDiagnosis.recommendedAction}
                  </div>

                  {request.aiDiagnosis.urgentSafetyTips && request.aiDiagnosis.urgentSafetyTips.length > 0 && (
                    <div className="pt-2 border-t border-blue-200 text-[11px]">
                      <span className="font-semibold text-rose-600 block">Safety Checklist:</span>
                      <ul className="list-disc list-inside text-[#475569] space-y-0.5 mt-0.5">
                        {request.aiDiagnosis.urgentSafetyTips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Assigned Fundi Card */}
              {request.assignedContractor && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#0045A5]" />
                      <h4 className="text-xs font-semibold text-[#0F172A]">
                        Dispatched Fundi
                      </h4>
                    </div>
                    {request.repairCost !== undefined && (
                      <span className="text-[11px] font-semibold text-[#0045A5]">
                        {formatKsh(request.repairCost)}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[#0F172A] space-y-0.5">
                    <p className="font-semibold">{request.assignedContractor.name} ({request.assignedContractor.company})</p>
                    <p className="text-[#64748B] text-[11px]">Phone: {request.assignedContractor.phone}</p>
                    <p className="text-[#64748B] text-[11px]">Date: {request.assignedContractor.scheduledDate} ({request.assignedContractor.estimatedArrival || 'TBD'})</p>
                  </div>
                </div>
              )}

              {/* Fundi Assignment Drawer/Form */}
              {isAssigning && (
                <form onSubmit={handleSaveContractor} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-md space-y-2.5 animate-fadeIn">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0045A5]">
                    Assign Nairobi Fundi & Schedule
                  </h4>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <input
                      type="text"
                      required
                      placeholder="Fundi Name (e.g. Fundi John Onyango)"
                      value={contractorName}
                      onChange={e => setContractorName(e.target.value)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-[#0045A5] focus:outline-hidden"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Company (e.g. Apex Plumbing Nairobi)"
                      value={contractorCompany}
                      onChange={e => setContractorCompany(e.target.value)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-[#0045A5] focus:outline-hidden"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Phone: +254 7..."
                        value={contractorPhone}
                        onChange={e => setContractorPhone(e.target.value)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-[#0045A5] focus:outline-hidden"
                      />
                      <input
                        type="text"
                        placeholder="WhatsApp (254...)"
                        value={contractorWhatsApp}
                        onChange={e => setContractorWhatsApp(e.target.value)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-[#0045A5] focus:outline-hidden"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={contractorDate}
                        onChange={e => setContractorDate(e.target.value)}
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:border-[#0045A5] focus:outline-hidden"
                      />
                      <input
                        type="number"
                        placeholder="Cost (KSh)"
                        value={contractorCost}
                        onChange={e => setContractorCost(e.target.value)}
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:border-[#0045A5] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAssigning(false)}
                      className="px-3 py-1 rounded-lg text-xs text-[#64748B] hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1 rounded-lg text-xs font-semibold bg-[#0045A5] hover:bg-[#003882] text-white"
                    >
                      Save Fundi Dispatch
                    </button>
                  </div>
                </form>
              )}

              {/* Danger Zone */}
              <div className="pt-2 text-right">
                <button
                  onClick={() => {
                    if (window.confirm('Delete this maintenance ticket?')) {
                      deleteMaintenanceRequest(request.id);
                    }
                  }}
                  className="text-[11px] text-rose-600 hover:underline"
                >
                  Delete Ticket
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
