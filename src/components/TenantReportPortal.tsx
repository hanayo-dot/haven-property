import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Building2, 
  Home, 
  User, 
  Phone, 
  Wrench, 
  X, 
  Loader2, 
  ArrowRight,
  Info,
  Zap,
  Droplets,
  Plug,
  Sun,
  AppWindow,
  Lock,
  Bug,
  AlertCircle
} from 'lucide-react';
import { useProperty } from '../context/PropertyContext';
import { DamagePhoto, IssueCategory, IssuePriority, MaintenanceRequest } from '../types';
import { SAMPLE_BREAKAGE_PRESETS } from '../data/mockData';
import { compressImage } from '../utils/imageCompressor';

interface TenantReportPortalProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const TenantReportPortal: React.FC<TenantReportPortalProps> = ({ isModal = false, onClose }) => {
  const { 
    properties, 
    units, 
    currentUser, 
    createMaintenanceRequest, 
    setSelectedRequestId,
    setIsReportModalOpen,
    setViewMode,
    setActiveTab,
    formatKsh
  } = useProperty();

  // Form State
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    currentUser?.propertyId || (properties[0]?.id || '')
  );
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    currentUser?.unitId || (units.find(u => u.propertyId === (currentUser?.propertyId || properties[0]?.id))?.id || '')
  );
  const [tenantName, setTenantName] = useState<string>(currentUser?.name || 'Juma Ochieng');
  const [tenantPhone, setTenantPhone] = useState<string>(currentUser?.phone || '+254 712 345 678');
  const [tenantEmail, setTenantEmail] = useState<string>(currentUser?.email || 'juma@havenresident.co.ke');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<IssueCategory>('Plumbing');
  const [priority, setPriority] = useState<IssuePriority>('Medium');
  const [entryPermission, setEntryPermission] = useState<boolean>(true);
  const [photos, setPhotos] = useState<DamagePhoto[]>([]);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedTicket, setSubmittedTicket] = useState<MaintenanceRequest | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Property units
  const propertyUnits = units.filter(u => u.propertyId === selectedPropertyId);
  const currentUnit = units.find(u => u.id === selectedUnitId);

  const handleUnitChange = (unitId: string) => {
    setSelectedUnitId(unitId);
  };

  const handleApplyPreset = (preset: typeof SAMPLE_BREAKAGE_PRESETS[0]) => {
    setTitle(preset.title);
    setCategory(preset.category as IssueCategory);
    setPriority(preset.priority as IssuePriority);
    setDescription(preset.description);
    
    const newPhoto: DamagePhoto = {
      id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      url: preset.photoUrl,
      caption: preset.caption,
      timestamp: new Date().toISOString(),
      tag: preset.category
    };
    setPhotos([newPhoto]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingPhotos(true);
    try {
      const compressedList: DamagePhoto[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedBase64 = await compressImage(file, 1200, 1200, 0.75);

        compressedList.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          url: compressedBase64,
          caption: file.name.replace(/\.[^/.]+$/, ''),
          timestamp: new Date().toISOString(),
          tag: 'Damaged Area'
        });
      }

      setPhotos(prev => [...prev, ...compressedList]);
    } catch (err) {
      console.error('Failed to compress uploaded photo:', err);
    } finally {
      setIsProcessingPhotos(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddSamplePhoto = () => {
    const samplePhotos = [
      {
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
        caption: 'Under-sink pipe joint leak with active dripping',
        tag: 'Leak Point'
      },
      {
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
        caption: 'Broken metal slider lock mechanism and cracked rail',
        tag: 'Damaged Latch'
      },
      {
        url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1000&q=80',
        caption: 'Hot water cylinder pressure relief valve continuous discharge',
        tag: 'Boiler Relief'
      }
    ];

    const pick = samplePhotos[photos.length % samplePhotos.length];
    setPhotos(prev => [
      ...prev,
      {
        id: `sample-photo-${Date.now()}`,
        url: pick.url,
        caption: pick.caption,
        timestamp: new Date().toISOString(),
        tag: pick.tag
      }
    ]);
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !selectedUnitId) return;

    setIsSubmitting(true);

    try {
      const prop = properties.find(p => p.id === selectedPropertyId);
      const unit = units.find(u => u.id === selectedUnitId);

      const newTicket = await createMaintenanceRequest({
        propertyId: selectedPropertyId,
        propertyName: prop?.name || 'Property',
        unitId: selectedUnitId,
        unitNumber: unit?.unitNumber || '101',
        tenantId: currentUser?.id,
        tenantName,
        tenantPhone,
        tenantEmail,
        title,
        description,
        category,
        priority,
        photos,
        entryPermission
      });

      setSubmittedTicket(newTicket);
    } catch (err) {
      console.error('Error submitting report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: { name: IssueCategory; icon: React.FC<{ className?: string }> }[] = [
    { name: 'Plumbing', icon: Droplets },
    { name: 'Electrical', icon: Zap },
    { name: 'Appliance', icon: Plug },
    { name: 'HVAC / Climate', icon: Sun },
    { name: 'Structural & Windows', icon: AppWindow },
    { name: 'Locks & Security', icon: Lock },
    { name: 'Pest Control', icon: Bug },
    { name: 'Other', icon: Wrench },
  ];

  const priorityOptions: {
    level: IssuePriority;
    label: string;
    sub: string;
    icon: React.FC<{ className?: string }>;
    color: string;
    activeBorder: string;
  }[] = [
    { 
      level: 'Emergency', 
      label: 'Emergency', 
      sub: 'Active flooding / spark', 
      icon: AlertTriangle,
      color: 'text-rose-600',
      activeBorder: 'bg-rose-50 border-rose-500 ring-1 ring-rose-500'
    },
    { 
      level: 'High', 
      label: 'High', 
      sub: 'Broken latch / shower', 
      icon: AlertCircle,
      color: 'text-amber-600',
      activeBorder: 'bg-amber-50 border-amber-500 ring-1 ring-amber-500'
    },
    { 
      level: 'Medium', 
      label: 'Medium', 
      sub: 'Dripping tap / slow drain', 
      icon: Zap,
      color: 'text-[#0045A5]',
      activeBorder: 'bg-blue-50 border-[#0045A5] ring-1 ring-[#0045A5]'
    },
    { 
      level: 'Low', 
      label: 'Routine', 
      sub: 'Cosmetic touch-up', 
      icon: CheckCircle2,
      color: 'text-emerald-600',
      activeBorder: 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
    }
  ];

  if (submittedTicket) {
    return (
      <div className="max-w-2xl mx-auto p-8 sm:p-10 glass-modal rounded-[32px] border border-white/90 shadow-xl text-center space-y-5 animate-fadeIn">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs border border-emerald-200">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-blue-50 text-[#0045A5] border border-blue-200">
            {submittedTicket.ticketNumber}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
            Maintenance Ticket Submitted
          </h2>
          <p className="text-[#64748B] text-xs sm:text-sm max-w-md mx-auto">
            Your property management team in Nairobi has been notified with your {photos.length} damage photo{photos.length !== 1 ? 's' : ''}.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
          <div className="flex items-center space-x-2 font-semibold text-[#0F172A]">
            <Sparkles className="w-3.5 h-3.5 text-[#0045A5]" />
            <span>Next Steps:</span>
          </div>
          <ul className="space-y-1 text-[#64748B] list-disc list-inside">
            <li>Multimodal Gemini AI Vision has estimated local repair costs in KSh and part requirements.</li>
            <li>Landlord Eleanor will assign a certified Nairobi fundi.</li>
            <li>You will receive SMS/WhatsApp updates when the technician is dispatched.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            id="view-ticket-in-dashboard-btn"
            onClick={() => {
              setSelectedRequestId(submittedTicket.id);
              if (currentUser?.role === 'landlord') {
                setViewMode('landlord');
                setActiveTab('maintenance');
              } else {
                setViewMode('tenant-portal');
              }
              if (onClose) onClose();
              setIsReportModalOpen(false);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0045A5] hover:bg-[#003882] text-white font-semibold text-xs shadow-xs transition flex items-center justify-center space-x-2"
          >
            <span>View Ticket Status</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setSubmittedTicket(null);
              setTitle('');
              setDescription('');
              setPhotos([]);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] font-semibold text-xs transition border border-slate-200"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-2xl mx-auto ${isModal ? 'p-3 sm:p-5' : 'p-3 sm:p-6'} space-y-5`}>
      
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0045A5] text-white flex items-center justify-center shadow-xs">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
              Report Breakage & Damage
            </h1>
            <p className="text-xs text-[#64748B]">
              Upload damage photos for automated AI diagnostics & fundi dispatch in Nairobi.
            </p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            id="close-report-modal-btn"
            onClick={onClose}
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Preset Fast-Test Bar */}
      <div className="p-3 rounded-2xl glass-card border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-1.5 font-semibold text-[#0F172A]">
          <Zap className="w-3.5 h-3.5 text-[#0045A5]" />
          <span>Kenyan Presets:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_BREAKAGE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[#0F172A] border border-slate-200 font-medium transition shadow-2xs"
            >
              {preset.title.split('&')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Step 1: Property & Unit Selection */}
        <div className="p-5 rounded-[22px] glass-card border border-slate-200/80 space-y-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#0045A5] flex items-center space-x-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Apartment & Resident Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Property Building *
              </label>
              <select
                id="tenant-report-property-select"
                required
                value={selectedPropertyId}
                onChange={e => {
                  setSelectedPropertyId(e.target.value);
                  setSelectedUnitId('');
                }}
                className="w-full text-xs rounded-xl glass-input text-[#0F172A] px-3 py-2 focus:outline-hidden"
              >
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Apartment / Unit # *
              </label>
              <select
                id="tenant-report-unit-select"
                value={selectedUnitId}
                onChange={e => handleUnitChange(e.target.value)}
                className="w-full text-xs rounded-xl glass-input text-[#0F172A] px-3 py-2 focus:outline-hidden"
              >
                <option value="">Select Unit</option>
                {propertyUnits.map(u => (
                  <option key={u.id} value={u.id}>Unit {u.unitNumber}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Full Name *
              </label>
              <input
                id="tenant-report-name-input"
                type="text"
                required
                placeholder="Juma Ochieng"
                value={tenantName}
                onChange={e => setTenantName(e.target.value)}
                className="w-full text-xs rounded-xl glass-input text-[#0F172A] px-3 py-2 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Phone Number (for fundi arrival SMS) *
              </label>
              <input
                id="tenant-report-phone-input"
                type="tel"
                required
                placeholder="+254 712 345 678"
                value={tenantPhone}
                onChange={e => setTenantPhone(e.target.value)}
                className="w-full text-xs rounded-xl glass-input text-[#0F172A] px-3 py-2 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Category & Issue Details */}
        <div className="p-5 rounded-[22px] glass-card border border-slate-200/80 space-y-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#0045A5] flex items-center space-x-1.5">
            <Wrench className="w-3.5 h-3.5" />
            <span>2. Issue & Severity</span>
          </h2>

          {/* Category Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {categories.map(cat => {
              const CategoryIcon = cat.icon;
              const isSelected = category === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-[#0045A5] text-white shadow-xs'
                      : 'bg-slate-50 text-[#0F172A] hover:bg-slate-100'
                  }`}
                >
                  <CategoryIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-[#0045A5]'}`} />
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Urgency */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {priorityOptions.map(p => {
              const PriorityIcon = p.icon;
              const isSelected = priority === p.level;
              return (
                <button
                  key={p.level}
                  type="button"
                  onClick={() => setPriority(p.level)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    isSelected
                      ? p.activeBorder
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <PriorityIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? '' : p.color}`} />
                    <span className="text-xs font-semibold text-[#0F172A]">{p.label}</span>
                  </div>
                  <div className="text-[10px] text-[#64748B] leading-tight mt-1">{p.sub}</div>
                </button>
              );
            })}
          </div>

          {/* Title & Description */}
          <div className="space-y-2 pt-1">
            <input
              id="tenant-report-title-input"
              type="text"
              required
              placeholder="Headline: e.g. Kitchen sink drainage pipe leaking onto cupboard shelf"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-xs rounded-xl glass-input text-[#0F172A] px-3 py-2 focus:outline-hidden"
            />

            <textarea
              id="tenant-report-description-input"
              required
              rows={2}
              placeholder="Detailed description: when it started, exact location in unit, noise/smell..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-xs rounded-xl glass-input text-[#0F172A] px-3 py-2 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Step 3: Photo Evidence Upload */}
        <div className="p-5 rounded-[22px] glass-card border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#0045A5] flex items-center space-x-1.5">
              <Camera className="w-3.5 h-3.5" />
              <span>3. Damage Pictures ({photos.length})</span>
            </h2>
            <span className="text-[11px] text-[#64748B]">
              Analyzed via Gemini Vision (KSh Estimates)
            </span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            multiple
            className="hidden"
          />

          <div className="grid grid-cols-2 gap-2.5">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-[#0045A5] rounded-2xl p-4 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition"
            >
              {isProcessingPhotos ? (
                <Loader2 className="w-5 h-5 text-[#0045A5] animate-spin mx-auto mb-1" />
              ) : (
                <Upload className="w-5 h-5 text-[#0045A5] mx-auto mb-1" />
              )}
              <p className="text-xs font-semibold text-[#0F172A]">
                {isProcessingPhotos ? 'Compressing...' : 'Upload / Snap Photos'}
              </p>
              <p className="text-[10px] text-[#64748B]">Auto-compressed</p>
            </div>

            <div
              onClick={handleAddSamplePhoto}
              className="border border-slate-200 hover:border-slate-300 rounded-2xl p-4 text-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition flex flex-col items-center justify-center"
            >
              <Sparkles className="w-5 h-5 text-[#0045A5] mb-1" />
              <p className="text-xs font-semibold text-[#0F172A]">+ Sample Photo</p>
              <p className="text-[10px] text-[#64748B]">Instant Nairobi damage test</p>
            </div>
          </div>

          {/* Attached Photo Previews */}
          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {photos.map(photo => (
                <div key={photo.id} className="relative rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200 group">
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black text-white rounded-md transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 4: Access Permissions */}
        <div className="p-4 rounded-[22px] glass-card border border-slate-200/80 space-y-2.5">
          <label className="flex items-start space-x-2.5 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={entryPermission}
              onChange={e => setEntryPermission(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#0045A5] rounded border-slate-300 focus:ring-[#0045A5]"
            />
            <span className="text-[#0F172A]">
              <strong>Permission to enter:</strong> Caretaker or fundi may enter apartment if I am not present.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          id="tenant-submit-breakage-btn"
          type="submit"
          disabled={isSubmitting || isProcessingPhotos}
          className="w-full py-3.5 rounded-xl bg-[#0045A5] hover:bg-[#003882] text-white font-semibold text-sm shadow-md transition active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing with Gemini AI (KSh)...</span>
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              <span>Submit Request ({photos.length} Photo{photos.length !== 1 ? 's' : ''})</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
};
