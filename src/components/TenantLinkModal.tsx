import React, { useState, useEffect } from 'react';
import { X, QrCode, Copy, Check, ExternalLink, Printer, Building2, Home, Smartphone, Camera } from 'lucide-react';
import { useProperty } from '../context/PropertyContext';

export const TenantLinkModal: React.FC = () => {
  const { 
    isTenantLinkModalOpen, 
    setIsTenantLinkModalOpen, 
    properties, 
    units, 
    tenantLinkUnitId, 
    setTenantLinkUnitId,
    setViewMode,
    setIsReportModalOpen 
  } = useProperty();

  const [copied, setCopied] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string>(tenantLinkUnitId || (units[0]?.id || ''));

  useEffect(() => {
    if (tenantLinkUnitId) {
      setSelectedUnit(tenantLinkUnitId);
    }
  }, [tenantLinkUnitId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTenantLinkModalOpen) {
        setIsTenantLinkModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTenantLinkModalOpen, setIsTenantLinkModalOpen]);

  if (!isTenantLinkModalOpen) return null;

  const currentUnit = units.find(u => u.id === selectedUnit) || units[0];
  const currentProperty = properties.find(p => p.id === currentUnit?.propertyId) || properties[0];

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://plotismarta.app';
  const shareableUrl = `${origin}/?portal=tenant-portal&property=${currentProperty?.id}&unit=${currentUnit?.id}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestTenantView = () => {
    setIsTenantLinkModalOpen(false);
    setViewMode('tenant-portal');
  };

  return (
    <div 
      id="tenant-link-backdrop"
      onClick={() => setIsTenantLinkModalOpen(false)}
      className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div 
        id="tenant-link-modal"
        onClick={e => e.stopPropagation()}
        className="glass-modal rounded-[36px] max-w-lg w-full p-7 space-y-6 shadow-2xl my-auto text-[#0F172A] animate-fadeIn border border-white/90"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#0045A5] text-white flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A]">
              Resident QR Code & Portal Link
            </h2>
          </div>
          <button
            onClick={() => setIsTenantLinkModalOpen(false)}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unit Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
            Select Apartment Unit for QR Code
          </label>
          <select
            value={selectedUnit}
            onChange={e => setSelectedUnit(e.target.value)}
            className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-[#0F172A] px-3.5 py-2.5 focus:border-[#0045A5] focus:outline-hidden"
          >
            {units.map(u => {
              const p = properties.find(prop => prop.id === u.propertyId);
              return (
                <option key={u.id} value={u.id}>
                  {p?.name} — Unit {u.unitNumber}
                </option>
              );
            })}
          </select>
        </div>

        {/* Printable Card Design Preview */}
        <div className="p-6 rounded-3xl bg-slate-50 border-2 border-dashed border-[#0045A5]/40 text-center space-y-4">
          
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#0045A5]">
              PlotiSmarta Resident Service Card
            </span>
            <h3 className="text-lg font-bold text-[#0F172A]">
              {currentProperty?.name}
            </h3>
            <p className="text-xs text-[#64748B] font-semibold">
              Apartment Unit {currentUnit?.unitNumber}
            </p>
          </div>

          {/* Stylized QR Code Visual */}
          <div className="w-44 h-44 bg-white p-3 rounded-2xl shadow-md mx-auto flex flex-col items-center justify-center relative border-4 border-[#0045A5]">
            {/* SVG QR Code Pattern */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-[#0F172A]">
              {/* Corner position markers */}
              <rect x="5" y="5" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="13" y="13" width="12" height="12" fill="currentColor" />
              
              <rect x="67" y="5" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="75" y="13" width="12" height="12" fill="currentColor" />
              
              <rect x="5" y="67" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="13" y="75" width="12" height="12" fill="currentColor" />

              {/* Data dots */}
              <rect x="42" y="10" width="6" height="6" fill="currentColor" />
              <rect x="52" y="10" width="6" height="6" fill="currentColor" />
              <rect x="42" y="24" width="16" height="6" fill="currentColor" />
              <rect x="10" y="42" width="6" height="16" fill="currentColor" />
              <rect x="24" y="42" width="12" height="6" fill="currentColor" />
              <rect x="44" y="44" width="12" height="12" rx="2" fill="#0045A5" />
              <rect x="65" y="42" width="10" height="6" fill="currentColor" />
              <rect x="80" y="42" width="10" height="6" fill="currentColor" />
              <rect x="65" y="55" width="6" height="15" fill="currentColor" />
              <rect x="78" y="55" width="12" height="6" fill="currentColor" />
              <rect x="42" y="68" width="8" height="8" fill="currentColor" />
              <rect x="55" y="78" width="14" height="6" fill="currentColor" />
              <rect x="75" y="75" width="15" height="15" fill="currentColor" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-[#0045A5] text-white p-1.5 rounded-lg shadow-md border-2 border-white">
                <Camera className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="space-y-0.5">
            <p className="text-xs font-bold text-[#0F172A]">
              Scan with smartphone camera
            </p>
            <p className="text-[11px] text-[#64748B]">
              Instant photo breakage & maintenance submission
            </p>
          </div>
        </div>

        {/* Shareable Link Box */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#64748B]">
            Direct Resident Web Link
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={shareableUrl}
              className="flex-1 text-xs rounded-xl border border-slate-200 bg-slate-50 text-[#0F172A] px-3.5 py-2.5 select-all focus:outline-hidden"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-[#0045A5] hover:bg-[#003882] text-white text-xs font-bold flex items-center space-x-1.5 transition shrink-0 shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-[#0F172A] flex items-center justify-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print QR Card</span>
          </button>

          <button
            onClick={handleTestTenantView}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0045A5] hover:bg-[#003882] text-white text-xs font-bold shadow-xs transition flex items-center justify-center space-x-1.5"
          >
            <Smartphone className="w-4 h-4" />
            <span>Open Resident Portal View</span>
          </button>
        </div>

      </div>
    </div>
  );
};
