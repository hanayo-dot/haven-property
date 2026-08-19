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
            <h1 className="text-2xl sm:text-3xl font-serif text-[#2C362C] tracking-tight">
              Properties & Units
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-[#F5F2EC] text-[#4A5D4A]">
              {properties.length} Estates
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8C8880] mt-0.5">
            Manage Nairobi apartment complexes, individual units, resident assignments, and QR reporting codes.
          </p>
        </div>

        <button
          id="properties-add-property-btn"
          onClick={() => setIsNewPropertyModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#5A6D5A] hover:bg-[#4D5E4D] text-white text-xs sm:text-sm font-semibold shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4 text-white/90" />
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
              className={`group rounded-[24px] overflow-hidden bg-white border transition-all duration-200 cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.02)] ${
                isSelected
                  ? 'border-[#5A6D5A] ring-2 ring-[#5A6D5A]/20 shadow-[0_8px_24px_rgba(90,109,90,0.08)]'
                  : 'border-[#EDE8DF]/90 hover:border-[#5A6D5A]/40 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]'
              }`}
            >
              {/* Image & Badges */}
              <div className="relative h-44 w-full overflow-hidden bg-[#F5F2EC]">
                <img
                  src={property.imageUrl}
                  alt={property.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C362C]/90 via-[#2C362C]/20 to-transparent flex flex-col justify-between p-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#2C362C]/80 text-white backdrop-blur-xs">
                      {property.type}
                    </span>
                    {openIssues > 0 && (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#D17A5E] text-white shadow-xs flex items-center space-x-1">
                        <Wrench className="w-3 h-3" />
                        <span>{openIssues} Open</span>
                      </span>
                    )}
                  </div>

                  <div className="text-white">
                    <h3 className="font-serif font-bold text-lg leading-snug">
                      {property.name}
                    </h3>
                    <p className="text-[11px] text-[#D1DCD1] flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#A8B6A8]" />
                      <span>{property.address}, {property.city}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Property Stats Body in KSh */}
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE8DF]/80">
                    <span className="text-[#8C8880] block text-[11px]">Occupancy</span>
                    <span className="font-semibold text-[#2C362C] text-xs mt-0.5 block">
                      {occupiedCount} / {propUnits.length} Units
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE8DF]/80">
                    <span className="text-[#8C8880] block text-[11px]">Monthly Rent</span>
                    <span className="font-serif font-bold text-[#4A5D4A] text-sm mt-0.5 block">
                      {formatKsh(monthlyRev)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-[#4A5D4A] pt-0.5">
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
        <div className="p-6 sm:p-7 rounded-[28px] bg-white border border-[#EDE8DF]/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
          
          {/* Header of Active Property */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F5F2EC]">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#F5F2EC] text-[#4A5D4A]">
                  Selected
                </span>
                <h2 className="text-xl sm:text-2xl font-serif text-[#2C362C]">
                  {activeProperty.name}
                </h2>
              </div>
              <p className="text-xs text-[#8C8880] mt-0.5">
                {activeProperty.description}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                id="prop-add-unit-toggle-btn"
                onClick={() => setIsAddUnitOpen(!isAddUnitOpen)}
                className="px-3.5 py-2 rounded-xl bg-[#5A6D5A] hover:bg-[#4D5E4D] text-white text-xs font-semibold shadow-xs transition flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Unit</span>
              </button>

              <button
                onClick={() => setIsTenantLinkModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F5F2EC] text-[#2C362C] border border-[#EDE8DF] text-xs font-semibold transition flex items-center space-x-1.5"
              >
                <QrCode className="w-3.5 h-3.5 text-[#5A6D5A]" />
                <span>Building QR Code</span>
              </button>
            </div>
          </div>

          {/* Add Unit Form Drawer */}
          {isAddUnitOpen && (
            <form onSubmit={handleCreateUnit} className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EDE8DF] space-y-3 animate-fadeIn">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#2C362C]">
                Add Apartment Unit to {activeProperty.name}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#8C8880] mb-1">Unit # *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3B"
                    value={newUnitNumber}
                    onChange={e => setNewUnitNumber(e.target.value)}
                    className="w-full text-xs rounded-xl border border-[#EDE8DF] bg-white text-[#2C362C] px-3 py-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#8C8880] mb-1">Monthly Rent (KSh) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 75000"
                    value={newUnitRent}
                    onChange={e => setNewUnitRent(e.target.value)}
                    className="w-full text-xs rounded-xl border border-[#EDE8DF] bg-white text-[#2C362C] px-3 py-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#8C8880] mb-1">Bedrooms</label>
                  <select
                    value={newUnitBeds}
                    onChange={e => setNewUnitBeds(e.target.value)}
                    className="w-full text-xs rounded-xl border border-[#EDE8DF] bg-white text-[#2C362C] px-3 py-2 focus:outline-none"
                  >
                    <option value="1">1 Bed (Studio)</option>
                    <option value="2">2 Beds</option>
                    <option value="3">3 Beds</option>
                    <option value="4">4 Beds</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#8C8880] mb-1">Bathrooms</label>
                  <select
                    value={newUnitBaths}
                    onChange={e => setNewUnitBaths(e.target.value)}
                    className="w-full text-xs rounded-xl border border-[#EDE8DF] bg-white text-[#2C362C] px-3 py-2 focus:outline-none"
                  >
                    <option value="1">1 Bath</option>
                    <option value="1.5">1.5 Baths</option>
                    <option value="2">2 Baths</option>
                    <option value="2.5">2.5 Baths</option>
                    <option value="3">3 Baths</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#8C8880] mb-1">Sq. Footage</label>
                  <input
                    type="number"
                    placeholder="e.g. 1100"
                    value={newUnitSqft}
                    onChange={e => setNewUnitSqft(e.target.value)}
                    className="w-full text-xs rounded-xl border border-[#EDE8DF] bg-white text-[#2C362C] px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddUnitOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs text-[#8C8880] hover:bg-[#F5F2EC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#5A6D5A] text-white shadow-xs"
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
                  className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EDE8DF]/90 hover:border-[#5A6D5A]/40 transition space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-[#EAE5DC] flex items-center justify-center font-bold text-xs text-[#2C362C]">
                        {unit.unitNumber}
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-[#2C362C] block leading-tight">
                          Unit {unit.unitNumber}
                        </span>
                        <span className="text-[10px] text-[#8C8880]">
                          {unit.bedrooms} Bed • {unit.bathrooms} Bath • {unit.sqft} sqft
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      unit.status === 'Occupied' 
                        ? 'bg-[#F2F6F2] text-[#4A5D4A]' 
                        : 'bg-[#FAF4EB] text-[#C28B38]'
                    }`}>
                      {unit.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#EDE8DF] flex items-center justify-between text-xs">
                    <span className="font-serif font-bold text-[#2C362C]">
                      {formatKsh(unit.rentAmount)} <span className="text-[10px] font-normal text-[#8C8880]">/mo</span>
                    </span>

                    <div className="flex items-center space-x-1">
                      {openReqs.length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-[#FBF1EE] text-[#D17A5E]">
                          {openReqs.length} ticket{openReqs.length > 1 ? 's' : ''}
                        </span>
                      )}

                      <button
                        onClick={() => {
                          setTenantLinkUnitId(unit.id);
                          setIsTenantLinkModalOpen(true);
                        }}
                        title="Generate unit QR code"
                        className="p-1 text-[#8C8880] hover:text-[#2C362C] rounded-lg transition"
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
