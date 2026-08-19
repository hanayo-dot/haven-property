import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  Home, 
  Wrench, 
  Lock, 
  Clock, 
  Zap, 
  ArrowRight, 
  Loader2 
} from 'lucide-react';
import { useProperty } from '../context/PropertyContext';
import { IssueCategory, IssuePriority, DamagePhoto } from '../types';
import { SAMPLE_BREAKAGE_PRESETS } from '../data/mockData';
import { compressImage } from '../utils/imageCompressor';

interface TenantReportPortalProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const TenantReportPortal: React.FC<TenantReportPortalProps> = ({ isModal = false, onClose }) => {
  const { 
    currentUser,
    properties, 
    units, 
    tenants, 
    addMaintenanceRequest, 
    setSelectedRequestId, 
    setViewMode, 
    setActiveTab,
    setIsReportModalOpen 
  } = useProperty();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(currentUser?.propertyId || properties[0]?.id || '');
  const [selectedUnitId, setSelectedUnitId] = useState<string>(currentUser?.unitId || '');
  const [tenantName, setTenantName] = useState(currentUser?.name || '');
  const [tenantPhone, setTenantPhone] = useState(currentUser?.phone || '+254 712 345 678');
  const [tenantEmail, setTenantEmail] = useState(currentUser?.email || '');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Plumbing');
  const [priority, setPriority] = useState<IssuePriority>('High');
  const [description, setDescription] = useState('');
  const [entryPermission, setEntryPermission] = useState(true);
  const [preferredTime, setPreferredTime] = useState('Morning (8:00 AM - 12:00 PM)');
  const [photos, setPhotos] = useState<DamagePhoto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{ id: string; ticketNumber: string } | null>(null);

  const propertyUnits = units.filter(u => u.propertyId === selectedPropertyId);

  // Deep linking URL query param parsing
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const paramProp = searchParams.get('property');
      const paramUnit = searchParams.get('unit');
      const paramCat = searchParams.get('category');

      if (paramProp && properties.some(p => p.id === paramProp)) {
        setSelectedPropertyId(paramProp);
      }
      if (paramUnit && units.some(u => u.id === paramUnit || u.unitNumber === paramUnit)) {
        const foundUnit = units.find(u => u.id === paramUnit || u.unitNumber === paramUnit);
        if (foundUnit) {
          setSelectedUnitId(foundUnit.id);
          if (foundUnit.propertyId) setSelectedPropertyId(foundUnit.propertyId);
          if (foundUnit.currentTenantId) {
            const tenant = tenants.find(t => t.id === foundUnit.currentTenantId);
            if (tenant) {
              setTenantName(tenant.name);
              setTenantPhone(tenant.phone);
              setTenantEmail(tenant.email);
            }
          }
        }
      }
      if (paramCat) {
        setCategory(paramCat as IssueCategory);
      }
    } catch (e) {
      console.warn('Error reading URL parameters:', e);
    }
  }, [properties, units, tenants]);

  // Prepopulate if currentUser changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !tenantName) setTenantName(currentUser.name);
      if (currentUser.phone && !tenantPhone) setTenantPhone(currentUser.phone);
      if (currentUser.email && !tenantEmail) setTenantEmail(currentUser.email);
      if (currentUser.propertyId && !selectedPropertyId) setSelectedPropertyId(currentUser.propertyId);
      if (currentUser.unitId && !selectedUnitId) setSelectedUnitId(currentUser.unitId);
    }
  }, [currentUser]);

  const handleUnitChange = (unitId: string) => {
    setSelectedUnitId(unitId);
    const unit = units.find(u => u.id === unitId);
    if (unit && unit.currentTenantId) {
      const tenant = tenants.find(t => t.id === unit.currentTenantId);
      if (tenant) {
        setTenantName(tenant.name);
        setTenantPhone(tenant.phone);
        setTenantEmail(tenant.email);
      }
    }
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
        caption: 'Instant water heater component fault',
        tag: 'Instant Shower'
      }
    ];
    const picked = samplePhotos[photos.length % samplePhotos.length];
    const newPhoto: DamagePhoto = {
      id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      url: picked.url,
      caption: picked.caption,
      timestamp: new Date().toISOString(),
      tag: picked.tag
    };
    setPhotos(prev => [...prev, newPhoto]);
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !selectedPropertyId) return;

    setIsSubmitting(true);

    const prop = properties.find(p => p.id === selectedPropertyId);
    const unit = units.find(u => u.id === selectedUnitId);

    try {
      const created = await addMaintenanceRequest({
        propertyId: selectedPropertyId,
        propertyName: prop?.name || 'Apartment Residence',
        unitId: selectedUnitId || (propertyUnits[0]?.id || 'unit-general'),
        unitNumber: unit?.unitNumber || (propertyUnits[0]?.unitNumber || 'Main'),
        tenantName: tenantName || 'Resident',
        tenantPhone: tenantPhone || '+254 712 345 678',
        tenantEmail: tenantEmail || 'resident@havenmgmt.co.ke',
        title,
        description,
        category,
        priority,
        status: 'New',
        entryPermission,
        preferredTime,
        photos
      });

      setSubmittedTicket({ id: created.id, ticketNumber: created.ticketNumber });
    } catch (err) {
      console.error('Error submitting maintenance request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: { name: IssueCategory; icon: string }[] = [
    { name: 'Plumbing', icon: '🚰' },
    { name: 'Electrical', icon: '⚡' },
    { name: 'Appliance', icon: '🧊' },
    { name: 'HVAC / Climate', icon: '☀️' },
    { name: 'Structural & Windows', icon: '🪟' },
    { name: 'Locks & Security', icon: '🔒' },
    { name: 'Pest Control', icon: '🐜' },
    { name: 'Other', icon: '🛠️' },
  ];

  if (submittedTicket) {
    return (
      <div className="max-w-2xl mx-auto p-8 sm:p-10 glass-modal rounded-[32px] border border-white/90 shadow-xl text-center space-y-5 animate-fadeIn">
        <div className="w-14 h-14 bg-[#F2F6F2] text-[#4A5D4A] rounded-full flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-[#FAF8F5] text-[#4A5D4A] border border-[#EDE8DF]">
            {submittedTicket.ticketNumber}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#2C362C]">
            Maintenance Ticket Submitted
          </h2>
          <p className="text-[#8C8880] text-xs sm:text-sm max-w-md mx-auto">
            Your property management team in Nairobi has been notified with your {photos.length} damage photo{photos.length !== 1 ? 's' : ''}.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 border border-[#EDE8DF]/80 text-left space-y-2 text-xs">
          <div className="flex items-center space-x-2 font-semibold text-[#2C362C]">
            <Sparkles className="w-3.5 h-3.5 text-[#5A6D5A]" />
            <span>Next Steps:</span>
          </div>
          <ul className="space-y-1 text-[#555555] list-disc list-inside">
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
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#5A6D5A] hover:bg-[#4D5E4D] text-white font-semibold text-xs shadow-xs transition flex items-center justify-center space-x-2"
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
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/80 hover:bg-white text-[#2C362C] font-semibold text-xs transition border border-[#EDE8DF]"
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
          <div className="w-10 h-10 rounded-2xl bg-[#5A6D5A] text-white flex items-center justify-center shadow-xs">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif text-[#2C362C]">
              Report Breakage & Damage
            </h1>
            <p className="text-xs text-[#8C8880]">
              Upload damage photos for automated AI diagnostics & fundi dispatch in Nairobi.
            </p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            id="close-report-modal-btn"
            onClick={onClose}
            className="p-2 text-[#8C8880] hover:text-[#2C362C] hover:bg-white/60 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Preset Fast-Test Bar */}
      <div className="p-3 rounded-2xl glass-card border border-white/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-1.5 font-semibold text-[#2C362C]">
          <Zap className="w-3.5 h-3.5 text-[#D17A5E]" />
          <span>Kenyan Presets:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_BREAKAGE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-[#2C362C] border border-[#EDE8DF] font-medium transition shadow-2xs"
            >
              {preset.title.split('&')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Step 1: Property & Unit Selection */}
        <div className="p-5 rounded-[22px] glass-card border border-white/80 space-y-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#5A6D5A] flex items-center space-x-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Apartment & Resident Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#8C8880] mb-1">
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
                className="w-full text-xs rounded-xl glass-input text-[#2C362C] px-3 py-2 focus:outline-hidden"
              >
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8C8880] mb-1">
                Apartment / Unit # *
              </label>
              <select
                id="tenant-report-unit-select"
                value={selectedUnitId}
                onChange={e => handleUnitChange(e.target.value)}
                className="w-full text-xs rounded-xl glass-input text-[#2C362C] px-3 py-2 focus:outline-hidden"
              >
                <option value="">Select Unit</option>
                {propertyUnits.map(u => (
                  <option key={u.id} value={u.id}>Unit {u.unitNumber}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8C8880] mb-1">
                Full Name *
              </label>
              <input
                id="tenant-report-name-input"
                type="text"
                required
                placeholder="Juma Ochieng"
                value={tenantName}
                onChange={e => setTenantName(e.target.value)}
                className="w-full text-xs rounded-xl glass-input text-[#2C362C] px-3 py-2 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8C8880] mb-1">
                Phone Number (for fundi arrival SMS) *
              </label>
              <input
                id="tenant-report-phone-input"
                type="tel"
                required
                placeholder="+254 712 345 678"
                value={tenantPhone}
                onChange={e => setTenantPhone(e.target.value)}
                className="w-full text-xs rounded-xl glass-input text-[#2C362C] px-3 py-2 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Category & Issue Details */}
        <div className="p-5 rounded-[22px] bg-white border border-[#EDE8DF]/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#5A6D5A] flex items-center space-x-1.5">
            <Wrench className="w-3.5 h-3.5" />
            <span>2. Issue & Severity</span>
          </h2>

          {/* Category Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {categories.map(cat => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setCategory(cat.name)}
                className={`flex items-center space-x-1.5 p-2 rounded-xl text-xs font-semibold transition ${
                  category === cat.name
                    ? 'bg-[#5A6D5A] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-[#2C362C] hover:bg-[#F2EFEA]'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Urgency */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {[
              { level: 'Emergency', label: '🚨 Emergency', sub: 'Active flooding / spark' },
              { level: 'High', label: '⚠️ High', sub: 'Broken latch / shower' },
              { level: 'Medium', label: '⚡ Medium', sub: 'Dripping tap / slow drain' },
              { level: 'Low', label: '🌱 Routine', sub: 'Cosmetic touch-up' }
            ].map(p => (
              <button
                key={p.level}
                type="button"
                onClick={() => setPriority(p.level as IssuePriority)}
                className={`p-2.5 rounded-xl border text-left transition ${
                  priority === p.level
                    ? 'bg-[#FBF1EE] border-[#D17A5E] ring-1 ring-[#D17A5E]'
                    : 'bg-[#FAF8F5] border-[#EDE8DF] hover:bg-[#F5F2EC]'
                }`}
              >
                <div className="text-xs font-semibold text-[#2C362C]">{p.label}</div>
                <div className="text-[10px] text-[#8C8880] leading-tight mt-0.5">{p.sub}</div>
              </button>
            ))}
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
              className="w-full text-xs rounded-xl border border-[#EDE8DF] bg-[#FAF8F5] text-[#2C362C] px-3 py-2 focus:bg-white focus:outline-none"
            />

            <textarea
              id="tenant-report-description-input"
              required
              rows={2}
              placeholder="Detailed description: when it started, exact location in unit, noise/smell..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-xs rounded-xl border border-[#EDE8DF] bg-[#FAF8F5] text-[#2C362C] px-3 py-2 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Step 3: Photo Evidence Upload */}
        <div className="p-5 rounded-[22px] bg-white border border-[#EDE8DF]/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#5A6D5A] flex items-center space-x-1.5">
              <Camera className="w-3.5 h-3.5" />
              <span>3. Damage Pictures ({photos.length})</span>
            </h2>
            <span className="text-[11px] text-[#8C8880]">
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
              className="border-2 border-dashed border-[#EDE8DF] hover:border-[#5A6D5A] rounded-2xl p-4 text-center cursor-pointer bg-[#FAF8F5] hover:bg-[#F2F6F2] transition"
            >
              {isProcessingPhotos ? (
                <Loader2 className="w-5 h-5 text-[#5A6D5A] animate-spin mx-auto mb-1" />
              ) : (
                <Upload className="w-5 h-5 text-[#5A6D5A] mx-auto mb-1" />
              )}
              <p className="text-xs font-semibold text-[#2C362C]">
                {isProcessingPhotos ? 'Compressing...' : 'Upload / Snap Photos'}
              </p>
              <p className="text-[10px] text-[#8C8880]">Auto-compressed</p>
            </div>

            <div
              onClick={handleAddSamplePhoto}
              className="border border-[#EDE8DF] hover:border-[#D6DCD6] rounded-2xl p-4 text-center cursor-pointer bg-[#FAF8F5] hover:bg-[#F5F2EC] transition flex flex-col items-center justify-center"
            >
              <Sparkles className="w-5 h-5 text-[#C28B38] mb-1" />
              <p className="text-xs font-semibold text-[#2C362C]">+ Sample Photo</p>
              <p className="text-[10px] text-[#8C8880]">Instant Nairobi damage test</p>
            </div>
          </div>

          {/* Attached Photo Previews */}
          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {photos.map(photo => (
                <div key={photo.id} className="relative rounded-xl overflow-hidden aspect-video bg-[#FAF8F5] border border-[#EDE8DF] group">
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
        <div className="p-4 rounded-[22px] bg-white border border-[#EDE8DF]/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-2.5">
          <label className="flex items-start space-x-2.5 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={entryPermission}
              onChange={e => setEntryPermission(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#5A6D5A] rounded border-[#EDE8DF] focus:ring-[#5A6D5A]"
            />
            <span className="text-[#2C362C]">
              <strong>Permission to enter:</strong> Caretaker or fundi may enter apartment if I am not present.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          id="tenant-submit-breakage-btn"
          type="submit"
          disabled={isSubmitting || isProcessingPhotos}
          className="w-full py-3.5 rounded-xl bg-[#5A6D5A] hover:bg-[#4D5E4D] text-white font-semibold text-sm shadow-md transition active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50"
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
