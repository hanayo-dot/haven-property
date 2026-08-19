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
    return `[WORK ORDER DISPATCH - HAVEN PROPERTY KENYA]
Ticket: ${request.ticketNumber} (${request.priority} Priority)
Property: ${request.propertyName} - Unit ${request.unitNumber}
Resident: ${request.tenantName} (Phone: ${request.tenantPhone})
Entry Permission: ${request.entryPermission ? 'Authorized to enter' : 'Tenant must be present'}
Preferred Time: ${request.preferredTime || 'Anytime'}

Issue: ${request.title}
Details: ${request.description}

AI Diagnosis: ${request.aiDiagnosis?.categorySummary || request.category}
Recommended Action: ${request.aiDiagnosis?.recommendedAction || 'Inspect and repair'}
Estimated Cost: ${request.aiDiagnosis?.estimatedCostRange || 'Standard rates'}
Suggested Trade: ${request.aiDiagnosis?.suggestedTrade || request.category}`;
  };

  const handleCopyDispatch = () => {
    navigator.clipboard.writeText(generateDispatchBriefing());
    setCopiedBriefing(true);
    setTimeout(() => setCopiedBriefing(false), 2500);
  };

  const priorityBadges = {
    Emergency: 'bg-[#FBF1EE] text-[#D17A5E]',
    High: 'bg-[#FAF4EB] text-[#C28B38]',
    Medium: 'bg-[#F2F6F2] text-[#4A5D4A]',
    Low: 'bg-[#F5F2EC] text-[#7A7A72]',
  };

  const whatsAppPhone = request.assignedContractor?.whatsApp || request.assignedContractor?.phone?.replace(/[^0-9]/g, '') || '';

  return (
    <div 
      id="maintenance-detail-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={() => setSelectedRequestId(null)}
      className="fixed inset-0 z-40 bg-[#2C362C]/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
    >
      <div 
        id="maintenance-detail-modal"
        onClick={e => e.stopPropagation()}
        className="bg-white border border-[#EDE8DF] rounded-[32px] max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-[#2C362C] my-auto"
      >
        {/* Modal Top Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 sm:px-8 py-4 border-b border-[#EDE8DF] flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-[#FAF8F5] text-[#4A5D4A] border border-[#EDE8DF]">
              {request.ticketNumber}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${priorityBadges[request.priority]}`}>
              {request.priority} Priority
            </span>
            <span className="text-xs text-[#8C8880] font-medium">
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
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F5F2EC] text-[#2C362C] border border-[#EDE8DF] transition"
            >
              {copiedBriefing ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#5A6D5A]" />
                  <span className="text-[#5A6D5A]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#8C8880]" />
                  <span className="hidden sm:inline">Copy SMS</span>
                </>
              )}
            </button>

            <button
              id="close-maintenance-detail-btn"
              onClick={() => setSelectedRequestId(null)}
              aria-label="Close dialog"
              className="p-1.5 rounded-lg text-[#8C8880] hover:text-[#2C362C] hover:bg-[#FAF8F5] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body - Clean 2 Column Grid */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Header Title & Property Breadcrumb */}
          <div className="space-y-1.5 pb-2">
            <h2 className="text-xl sm:text-2xl font-serif text-[#2C362C] tracking-tight">
              {request.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#8C8880]">
              <span className="font-semibold text-[#2C362C] flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-[#5A6D5A]" />
                <span>{request.propertyName}</span>
              </span>
              <span>•</span>
              <span className="font-semibold text-[#2C362C]">Unit {request.unitNumber}</span>
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C8880]">
                    Damage Photo Evidence ({request.photos.length})
                  </h3>
                  {request.photos.length > 0 && (
                    <button
                      onClick={() => openPhotoViewer(request.photos, 0, `${request.ticketNumber}: ${request.title}`)}
                      className="text-xs font-semibold text-[#4A5D4A] hover:underline flex items-center space-x-1"
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
                        className="group relative rounded-2xl overflow-hidden aspect-square bg-[#FAF8F5] border border-[#EDE8DF] cursor-pointer shadow-xs hover:shadow-md transition duration-200"
                      >
                        <img
                          src={photo.url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {photo.tag && (
                          <span className="absolute top-2 left-2 text-[9px] font-semibold px-2 py-0.5 rounded-md bg-[#2C362C]/80 text-white backdrop-blur-xs">
                            {photo.tag}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-dashed border-[#EDE8DF] text-center text-xs text-[#8C8880]">
                    No photos attached.
                  </div>
                )}
              </div>

              {/* Description Box */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EDE8DF] space-y-1.5">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8880]">
                  Resident Description
                </h4>
                <p className="text-xs sm:text-sm text-[#2C362C] leading-relaxed">
                  {request.description}
                </p>
                <div className="pt-2 text-[11px] text-[#8C8880] flex items-center space-x-3">
                  <span>Resident: <strong className="text-[#2C362C]">{request.tenantName}</strong> ({request.tenantPhone})</span>
                  <span>•</span>
                  <span>Entry: {request.entryPermission ? 'Authorized' : 'Must be present'}</span>
                </div>
              </div>

              {/* Timeline & Notes */}
              <div className="space-y-3 pt-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C8880] flex items-center space-x-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Activity & Timeline</span>
                </h3>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {request.timeline.map(entry => (
                    <div 
                      key={entry.id}
                      className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE8DF] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#2C362C]">{entry.author}</span>
                        <span className="text-[#8C8880]">
                          {new Date(entry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[#4A4844]">{entry.description}</p>
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
                    className="flex-1 text-xs rounded-xl border border-[#EDE8DF] bg-white text-[#2C362C] px-3 py-2 focus:ring-2 focus:ring-[#5A6D5A]/30 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-[#5A6D5A] hover:bg-[#4D5E4D] text-white text-xs font-semibold shadow-xs transition"
                  >
                    Post
                  </button>
                </form>
              </div>

            </div>

            {/* Right Column: Actions + AI Diagnosis + Fundi Dispatch (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Quick Status Control */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EDE8DF] space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8C8880] mb-1">
                      Status
                    </label>
                    <select
                      value={request.status}
                      onChange={e => handleStatusChange(e.target.value as IssueStatus)}
                      className="w-full text-xs font-semibold rounded-xl border border-[#EDE8DF] bg-white text-[#2C362C] px-2.5 py-2 focus:outline-none"
                    >
                      <option value="New">New</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#8C8880] mb-1">
                      Priority
                    </label>
                    <select
                      value={request.priority}
                      onChange={e => handlePriorityChange(e.target.value as IssuePriority)}
                      className="w-full text-xs font-semibold rounded-xl border border-[#EDE8DF] bg-white text-[#2C362C] px-2.5 py-2 focus:outline-none"
                    >
                      <option value="Emergency">🚨 Emergency</option>
                      <option value="High">⚠️ High</option>
                      <option value="Medium">⚡ Medium</option>
                      <option value="Low">🌱 Routine</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => setIsAssigning(!isAssigning)}
                  className="w-full py-2 rounded-xl bg-[#5A6D5A] hover:bg-[#4D5E4D] text-white text-xs font-semibold shadow-xs transition flex items-center justify-center space-x-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{request.assignedContractor ? 'Edit Fundi Assignment' : 'Dispatch Fundi / Tech'}</span>
                </button>
              </div>

              {/* Gemini AI Diagnostic Assistant Card (in KSh) */}
              {request.aiDiagnosis && (
                <div className="rounded-2xl bg-[#F2F6F2] border border-[#D6DCD6] p-4 space-y-2.5">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#5A6D5A]" />
                    <h4 className="text-xs font-serif font-bold text-[#2C362C]">
                      Gemini AI Triage Assessment
                    </h4>
                  </div>

                  <p className="text-xs text-[#2C362C] font-semibold">
                    {request.aiDiagnosis.categorySummary}
                  </p>

                  <div className="pt-2 border-t border-[#D6DCD6] grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[#7A8A7A] block">Estimated Cost</span>
                      <strong className="text-[#4A5D4A] font-semibold">{request.aiDiagnosis.estimatedCostRange}</strong>
                    </div>
                    <div>
                      <span className="text-[#7A8A7A] block">Suggested Fundi</span>
                      <strong className="text-[#2C362C]">{request.aiDiagnosis.suggestedTrade}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#D6DCD6] text-[11px] text-[#4A4844]">
                    <span className="font-semibold block text-[#2C362C] mb-0.5">Recommended Action:</span>
                    {request.aiDiagnosis.recommendedAction}
                  </div>

                  {request.aiDiagnosis.urgentSafetyTips && request.aiDiagnosis.urgentSafetyTips.length > 0 && (
                    <div className="pt-2 border-t border-[#D6DCD6] text-[11px]">
                      <span className="font-semibold text-[#D17A5E] block">Safety Checklist:</span>
                      <ul className="list-disc list-inside text-[#555555] space-y-0.5 mt-0.5">
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
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EDE8DF] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#5A6D5A]" />
                      <h4 className="text-xs font-semibold text-[#2C362C]">
                        Dispatched Fundi
                      </h4>
                    </div>
                    {request.repairCost !== undefined && (
                      <span className="text-[11px] font-semibold text-[#4A5D4A]">
                        {formatKsh(request.repairCost)}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[#2C362C] space-y-0.5">
                    <p className="font-semibold">{request.assignedContractor.name} ({request.assignedContractor.company})</p>
                    <p className="text-[#8C8880] text-[11px]">Phone: {request.assignedContractor.phone}</p>
                    <p className="text-[#8C8880] text-[11px]">Date: {request.assignedContractor.scheduledDate} ({request.assignedContractor.estimatedArrival || 'TBD'})</p>
                  </div>
                </div>
              )}

              {/* Fundi Assignment Drawer/Form */}
              {isAssigning && (
                <form onSubmit={handleSaveContractor} className="p-4 rounded-2xl bg-white border border-[#EDE8DF] shadow-md space-y-2.5 animate-fadeIn">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A6D5A]">
                    Assign Nairobi Fundi & Schedule
                  </h4>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <input
                      type="text"
                      required
                      placeholder="Fundi Name (e.g. Fundi John Onyango)"
                      value={contractorName}
                      onChange={e => setContractorName(e.target.value)}
                      className="rounded-lg border border-[#EDE8DF] px-2.5 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Company (e.g. Apex Plumbing Nairobi)"
                      value={contractorCompany}
                      onChange={e => setContractorCompany(e.target.value)}
                      className="rounded-lg border border-[#EDE8DF] px-2.5 py-1.5 text-xs"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Phone: +254 7..."
                        value={contractorPhone}
                        onChange={e => setContractorPhone(e.target.value)}
                        className="rounded-lg border border-[#EDE8DF] px-2.5 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="WhatsApp (254...)"
                        value={contractorWhatsApp}
                        onChange={e => setContractorWhatsApp(e.target.value)}
                        className="rounded-lg border border-[#EDE8DF] px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={contractorDate}
                        onChange={e => setContractorDate(e.target.value)}
                        className="rounded-lg border border-[#EDE8DF] px-2 py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Cost (KSh)"
                        value={contractorCost}
                        onChange={e => setContractorCost(e.target.value)}
                        className="rounded-lg border border-[#EDE8DF] px-2 py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAssigning(false)}
                      className="px-3 py-1 rounded-lg text-xs text-[#8C8880] hover:bg-[#F5F2EC]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1 rounded-lg text-xs font-semibold bg-[#5A6D5A] text-white"
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
                  className="text-[11px] text-[#D17A5E] hover:underline"
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
