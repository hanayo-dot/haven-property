import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Plus, Image as ImageIcon } from 'lucide-react';
import { useProperty } from '../context/PropertyContext';
import { Property } from '../types';

export const NewPropertyModal: React.FC = () => {
  const { isNewPropertyModalOpen, setIsNewPropertyModalOpen, addProperty } = useProperty();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Nairobi');
  const [state, setState] = useState('Kilimani');
  const [zip, setZip] = useState('00100');
  const [type, setType] = useState<Property['type']>('Apartment Complex');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80');
  const [description, setDescription] = useState('');
  const [yearBuilt, setYearBuilt] = useState('2022');
  const [totalUnits, setTotalUnits] = useState('8');
  const [mpesaPaybill, setMpesaPaybill] = useState('880120');
  const [caretakerName, setCaretakerName] = useState('Mwangi Kamau');
  const [caretakerPhone, setCaretakerPhone] = useState('+254 722 123 456');
  const [managerName, setManagerName] = useState('Eleanor Wanjiku');
  const [managerPhone, setManagerPhone] = useState('+254 722 555 101');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isNewPropertyModalOpen) {
        setIsNewPropertyModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNewPropertyModalOpen, setIsNewPropertyModalOpen]);

  if (!isNewPropertyModalOpen) return null;

  const sampleImages = [
    { label: 'Kilimani High-Rise', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80' },
    { label: 'Westlands Modern Suites', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80' },
    { label: 'Kileleshwa Luxury Townhouse', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80' },
    { label: 'Lavington Garden Court', url: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=800&q=80' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;

    addProperty({
      name,
      address,
      city,
      state,
      zip,
      type,
      imageUrl,
      totalUnits: parseInt(totalUnits) || 4,
      description: description || 'Modern residential property in Nairobi with borehole water, CCTV, and backup generator.',
      yearBuilt: parseInt(yearBuilt) || 2022,
      mpesaPaybill: mpesaPaybill || '880120',
      caretakerContact: {
        name: caretakerName,
        phone: caretakerPhone,
        whatsApp: caretakerPhone.replace(/[^0-9]/g, '')
      },
      managerContact: {
        name: managerName,
        phone: managerPhone,
        email: 'wanjiku@plotismarta.co.ke'
      }
    });

    setIsNewPropertyModalOpen(false);
  };

  return (
    <div 
      id="new-property-backdrop"
      onClick={() => setIsNewPropertyModalOpen(false)}
      className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div 
        id="new-property-modal"
        onClick={e => e.stopPropagation()}
        className="glass-modal rounded-[32px] max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-auto text-[#0F172A] animate-fadeIn border border-white/90"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#0045A5] text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A]">
              Add Nairobi Property
            </h2>
          </div>
          <button
            onClick={() => setIsNewPropertyModalOpen(false)}
            className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Property / Estate Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Riverside Palms Residency"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[#0F172A] focus:bg-white focus:outline-hidden focus:border-[#0045A5]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Street Address / Location in Nairobi *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Riverside Drive, off Chiromo Road"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[#0F172A] focus:bg-white focus:outline-hidden focus:border-[#0045A5]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Neighborhood / Estate *
              </label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[#0F172A] focus:bg-white focus:outline-hidden focus:border-[#0045A5]"
              >
                <option value="Kilimani">Kilimani</option>
                <option value="Westlands">Westlands</option>
                <option value="Kileleshwa">Kileleshwa</option>
                <option value="Lavington">Lavington</option>
                <option value="Parklands">Parklands</option>
                <option value="Karen">Karen</option>
                <option value="South B / South C">South B / South C</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Property Type
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as Property['type'])}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[#0F172A] focus:bg-white focus:outline-hidden focus:border-[#0045A5]"
              >
                <option value="Apartment Complex">Apartment Complex</option>
                <option value="Residential Court">Residential Court</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Gated Community">Gated Community</option>
                <option value="Condo">Condo</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Total Apartment Units
              </label>
              <input
                type="number"
                value={totalUnits}
                onChange={e => setTotalUnits(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[#0F172A] focus:bg-white focus:outline-hidden focus:border-[#0045A5]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                M-Pesa Paybill Number
              </label>
              <input
                type="text"
                value={mpesaPaybill}
                onChange={e => setMpesaPaybill(e.target.value)}
                placeholder="880120"
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[#0F172A] focus:bg-white focus:outline-hidden focus:border-[#0045A5]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Caretaker Name
              </label>
              <input
                type="text"
                value={caretakerName}
                onChange={e => setCaretakerName(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[#0F172A] focus:bg-white focus:outline-hidden focus:border-[#0045A5]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Caretaker Phone (+254)
              </label>
              <input
                type="tel"
                value={caretakerPhone}
                onChange={e => setCaretakerPhone(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[#0F172A] focus:bg-white focus:outline-hidden focus:border-[#0045A5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] mb-1.5">
              Select Preset Photo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sampleImages.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setImageUrl(img.url)}
                  className={`rounded-xl overflow-hidden aspect-video border cursor-pointer transition ${
                    imageUrl === img.url ? 'border-[#0045A5] ring-2 ring-[#0045A5]' : 'border-slate-200'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewPropertyModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-[#64748B] hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0045A5] hover:bg-[#003882] text-white font-semibold text-xs shadow-xs"
            >
              Create Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
