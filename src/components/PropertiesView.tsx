import React, { useState } from 'react';
import { 
  Building2, 
  Home, 
  PlusCircle, 
  DollarSign, 
  Users, 
  Wrench, 
  MapPin, 
  ChevronRight, 
  QrCode, 
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { useProperty } from '../context/PropertyContext';
import { Property, Unit } from '../types';

interface PropertiesViewProps {
  onSelectProperty?: (propertyId: string) => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = () => {
  const { 
    properties, 
    units, 
    maintenanceRequests, 
    selectedPropertyId, 
    setSelectedPropertyId, 
    setIsNewPropertyModalOpen,
    setIsTenantLinkModalOpen,
    setTenantLinkUnitId,
    setIsReportModalOpen,
    formatKsh,
    addUnit 
  } = useProperty();

  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [newUnitNumber, setNewUnitNumber] = useState('');
  const [newUnitRent, setNewUnitRent] = useState('75000');
  const [newUnitBeds, setNewUnitBeds] = useState('2');
  const [newUnitBaths, setNewUnitBaths] = useState('2');
  const [newUnitSqft, setNewUnitSqft] = useState('1100');

  const activeProperty = properties.find(p => p.id === selectedPropertyId) || properties[0];

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProperty || !newUnitNumber || !newUnitRent) return;

    addUnit({
      propertyId: activeProperty.id,
      unitNumber: newUnitNumber,
      floor: parseInt(newUnitNumber[0]) || 1,
      rentAmount: parseFloat(newUnitRent),
      bedrooms: parseInt(newUnitBeds),
      bathrooms: parseFloat(newUnitBaths),
      sqft: parseInt(newUnitSqft),
      status: 'Vacant',
      depositAmount: parseFloat(newUnitRent)
    });

    setNewUnitNumber('');
    setNewUnitRent('75000');
    setIsAddUnitOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Properties & Units
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-50 text-[#0045A5] border border-blue-200">
              {properties.length} Estates
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Manage Nairobi apartment complexes, individual units, resident assignments, and QR reporting codes.
          </p>
        </div>

        <button
          id="properties-add-property-btn"
          onClick={() => setIsNewPropertyModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#0045A5] hover:bg-[#003882] text-white text-xs sm:text-sm font-semibold shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4 text-white" />
          <span>Add Property</span>
        </button>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {properties.map(property => {
          const propUnits = units.filter(u => u.propertyId === property.id);
          const occupiedCount = propUnits.filter(u => u.status === 'Occupied').length;
          const openIssues = maintenanceRequests.filter(r => r.propertyId === property.id && r.status !== 'Resolved').length;
          const isSelected = activeProperty?.id === property.id;
          const monthlyRev = propUnits.filter(u => u.status === 'Occupied').reduce((sum, u) => sum + u.rentAmount, 0);

          return (
            <div
              key={property.id}
              onClick={() => setSelectedPropertyId(property.id)}
              className={`group rounded-[24px] overflow-hidden glass-card glass-card-hover border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-[#0045A5] ring-2 ring-[#0045A5]/20 shadow-[0_12px_32px_rgba(0,69,165,0.12)]'
                  : 'border-slate-200/80'
              }`}
            >
              {/* Image & Badges */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={property.imageUrl}
                  alt={property.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/20 to-transparent flex flex-col justify-between p-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#0F172A]/80 text-white backdrop-blur-xs">
                      {property.type}
                    </span>
                    {openIssues > 0 && (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-600 text-white shadow-xs flex items-center space-x-1">
                        <Wrench className="w-3 h-3" />
                        <span>{openIssues} Open</span>
                      </span>
                    )}
                  </div>

                  <div className="text-white">
                    <h3 className="font-bold text-lg leading-snug">
                      {property.name}
                    </h3>
                    <p className="text-[11px] text-slate-200 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-sky-300" />
                      <span>{property.address}, {property.city}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Property Stats Body in KSh */}
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[#64748B] block text-[11px]">Occupancy</span>
                    <span className="font-semibold text-[#0F172A] text-xs mt-0.5 block">
                      {occupiedCount} / {propUnits.length} Units
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[#64748B] block text-[11px]">Monthly Rent</span>
                    <span className="font-bold text-[#0045A5] text-sm mt-0.5 block">
                      {formatKsh(monthlyRev)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-[#0045A5] pt-0.5">
                  <span>{isSelected ? 'Viewing Units Below' : 'Click to View Units'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Property Deep Dive & Units Table */}
      {activeProperty && (
        <div className="p-6 sm:p-7 rounded-[28px] glass-card border border-slate-200/80 space-y-5">
          
          {/* Header of Active Property */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-blue-50 text-[#0045A5]">
                  Selected
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                  {activeProperty.name}
                </h2>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                {activeProperty.description}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                id="prop-add-unit-toggle-btn"
                onClick={() => setIsAddUnitOpen(!isAddUnitOpen)}
                className="px-3.5 py-2 rounded-xl bg-[#0045A5] hover:bg-[#003882] text-white text-xs font-semibold shadow-xs transition flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Unit</span>
              </button>

              <button
                onClick={() => setIsTenantLinkModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] border border-slate-200 text-xs font-semibold transition flex items-center space-x-1.5"
              >
                <QrCode className="w-3.5 h-3.5 text-[#0045A5]" />
                <span>Building QR Code</span>
              </button>
            </div>
          </div>

          {/* Add Unit Form Drawer */}
          {isAddUnitOpen && (
            <form onSubmit={handleCreateUnit} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-fadeIn">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                Add Apartment Unit to {activeProperty.name}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Unit # *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3B"
                    value={newUnitNumber}
                    onChange={e => setNewUnitNumber(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white text-[#0F172A] px-3 py-2 focus:outline-hidden focus:border-[#0045A5]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Monthly Rent (KSh) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 75000"
                    value={newUnitRent}
                    onChange={e => setNewUnitRent(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white text-[#0F172A] px-3 py-2 focus:outline-hidden focus:border-[#0045A5]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Bedrooms</label>
                  <select
                    value={newUnitBeds}
                    onChange={e => setNewUnitBeds(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white text-[#0F172A] px-3 py-2 focus:outline-hidden"
                  >
                    <option value="1">1 Bed (Studio)</option>
                    <option value="2">2 Beds</option>
                    <option value="3">3 Beds</option>
                    <option value="4">4 Beds</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Bathrooms</label>
                  <select
                    value={newUnitBaths}
                    onChange={e => setNewUnitBaths(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white text-[#0F172A] px-3 py-2 focus:outline-hidden"
                  >
                    <option value="1">1 Bath</option>
                    <option value="1.5">1.5 Baths</option>
                    <option value="2">2 Baths</option>
                    <option value="2.5">2.5 Baths</option>
                    <option value="3">3 Baths</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Sq. Footage</label>
                  <input
                    type="number"
                    placeholder="e.g. 1100"
                    value={newUnitSqft}
                    onChange={e => setNewUnitSqft(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white text-[#0F172A] px-3 py-2 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddUnitOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs text-[#64748B] hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#0045A5] text-white shadow-xs"
                >
                  Save Unit
                </button>
              </div>
            </form>
          )}

          {/* Units Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {units.filter(u => u.propertyId === activeProperty.id).map(unit => {
              const openReqs = maintenanceRequests.filter(r => r.unitId === unit.id && r.status !== 'Resolved');
              return (
                <div
                  key={unit.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-[#0045A5]/40 transition space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-[#0045A5]">
                        {unit.unitNumber}
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-[#0F172A] block leading-tight">
                          Unit {unit.unitNumber}
                        </span>
                        <span className="text-[10px] text-[#64748B]">
                          {unit.bedrooms} Bed • {unit.bathrooms} Bath • {unit.sqft} sqft
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      unit.status === 'Occupied' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {unit.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0F172A]">
                      {formatKsh(unit.rentAmount)} <span className="text-[10px] font-normal text-[#64748B]">/mo</span>
                    </span>

                    <div className="flex items-center space-x-1">
                      {openReqs.length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                          {openReqs.length} ticket{openReqs.length > 1 ? 's' : ''}
                        </span>
                      )}

                      <button
                        onClick={() => {
                          setTenantLinkUnitId(unit.id);
                          setIsTenantLinkModalOpen(true);
                        }}
                        title="Generate unit QR code"
                        className="p-1 text-[#64748B] hover:text-[#0F172A] rounded-lg transition"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
