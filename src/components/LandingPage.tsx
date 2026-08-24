import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Search, 
  DollarSign, 
  ChevronDown, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  Sparkles, 
  Wrench, 
  Phone,
  Camera,
  Star,
  Users,
  Home
} from 'lucide-react';
import { useProperty } from '../context/PropertyContext';
import { Property } from '../types';

interface LandingPageProps {
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const { properties, units, formatKsh } = useProperty();

  const [activeNav, setActiveNav] = useState<'home' | 'properties' | 'services' | 'about' | 'contact'>('home');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All Prices');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(properties);
  const [isContactSubmitted, setIsContactSubmitted] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveNav('properties');
    
    let result = properties;
    if (searchLocation.trim()) {
      const loc = searchLocation.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(loc) || 
        p.address.toLowerCase().includes(loc) || 
        p.city.toLowerCase().includes(loc) ||
        p.state.toLowerCase().includes(loc)
      );
    }
    if (selectedType !== 'All Types') {
      result = result.filter(p => p.type.toLowerCase().includes(selectedType.toLowerCase()));
    }
    setFilteredProperties(result);

    const propertiesElement = document.getElementById('section-properties');
    if (propertiesElement) {
      propertiesElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSection = (sectionId: string, navKey: 'home' | 'properties' | 'services' | 'about' | 'contact') => {
    setActiveNav(navKey);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1E293B] antialiased flex flex-col font-sans selection:bg-[#0B57D0] selection:text-white">
      
      {/* --- Top Navigation Bar matching reference --- */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-6 sm:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => scrollToSection('section-hero', 'home')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0045A5] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
              <Building2 className="w-4.5 h-4.5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-[#0F172A]">
              PlotiSmarta
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#64748B]">
            <button
              onClick={() => scrollToSection('section-hero', 'home')}
              className={`relative py-1 transition hover:text-[#0F172A] ${
                activeNav === 'home' ? 'text-[#0B57D0] font-semibold' : ''
              }`}
            >
              Home
              {activeNav === 'home' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B57D0] rounded-full" />
              )}
            </button>

            <button
              onClick={() => scrollToSection('section-properties', 'properties')}
              className={`relative py-1 transition hover:text-[#0F172A] ${
                activeNav === 'properties' ? 'text-[#0B57D0] font-semibold' : ''
              }`}
            >
              Properties
              {activeNav === 'properties' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B57D0] rounded-full" />
              )}
            </button>

            <button
              onClick={() => scrollToSection('section-services', 'services')}
              className={`relative py-1 transition hover:text-[#0F172A] ${
                activeNav === 'services' ? 'text-[#0B57D0] font-semibold' : ''
              }`}
            >
              Services
              {activeNav === 'services' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B57D0] rounded-full" />
              )}
            </button>

            <button
              onClick={() => scrollToSection('section-about', 'about')}
              className={`relative py-1 transition hover:text-[#0F172A] ${
                activeNav === 'about' ? 'text-[#0B57D0] font-semibold' : ''
              }`}
            >
              About
              {activeNav === 'about' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B57D0] rounded-full" />
              )}
            </button>

            <button
              onClick={() => scrollToSection('section-contact', 'contact')}
              className={`relative py-1 transition hover:text-[#0F172A] ${
                activeNav === 'contact' ? 'text-[#0B57D0] font-semibold' : ''
              }`}
            >
              Contact
              {activeNav === 'contact' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B57D0] rounded-full" />
              )}
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            <button
              id="landing-login-btn"
              onClick={() => onOpenAuth('signin')}
              className="text-sm font-semibold text-[#0F172A] hover:text-[#0B57D0] transition"
            >
              Login
            </button>

            <button
              id="landing-signup-btn"
              onClick={() => onOpenAuth('signup')}
              className="px-5 py-2.5 rounded-lg bg-[#0045A5] hover:bg-[#003882] text-white text-sm font-semibold shadow-xs transition active:scale-95"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* --- Hero Section matching reference exactly --- */}
      <section 
        id="section-hero"
        className="relative min-h-[82vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.65)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85')`
        }}
      >
        {/* Soft Background Blur Overlay */}
        <div className="absolute inset-0 backdrop-blur-[1.5px] bg-white/20 pointer-events-none" />

        <div className="relative z-10 max-w-4xl w-full mx-auto text-center space-y-7">
          
          {/* Main Titles */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
              Management Made Simple.
            </h1>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0B57D0] tracking-tight leading-tight">
              Living Made Better.
            </h2>
          </div>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#475569] max-w-2xl mx-auto font-normal leading-relaxed">
            The all-in-one platform for property owners to scale their portfolio and tenants to find their next home.
          </p>

          {/* Floating Glassmorphic Search Bar */}
          <form 
            onSubmit={handleSearch}
            className="mt-8 p-2.5 sm:p-3 rounded-2xl sm:rounded-full bg-white/90 backdrop-blur-xl border border-white/80 shadow-[0_12px_40px_rgba(0,0,0,0.08)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 max-w-3xl mx-auto"
          >
            {/* Segment 1: Location */}
            <div className="flex-1 flex items-center px-4 py-2.5 rounded-xl sm:rounded-full bg-slate-50/80 sm:bg-transparent border sm:border-0 border-slate-200/80 text-left">
              <MapPin className="w-4 h-4 text-[#64748B] shrink-0 mr-2.5" />
              <input
                type="text"
                placeholder="Location (e.g. Kilimani, Westlands)"
                value={searchLocation}
                onChange={e => setSearchLocation(e.target.value)}
                className="w-full text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] bg-transparent focus:outline-hidden"
              />
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-7 bg-[#E2E8F0]" />

            {/* Segment 2: Property Type Dropdown */}
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => {
                  setIsTypeDropdownOpen(!isTypeDropdownOpen);
                  setIsPriceDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl sm:rounded-full bg-slate-50/80 sm:bg-transparent border sm:border-0 border-slate-200/80 text-left text-xs sm:text-sm text-[#0F172A]"
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Building2 className="w-4 h-4 text-[#64748B] shrink-0" />
                  <span className="truncate">{selectedType}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] shrink-0 ml-1" />
              </button>

              {isTypeDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl bg-white border border-slate-200 shadow-xl z-30 text-xs space-y-1 animate-fadeIn">
                  {['All Types', 'Apartment', 'Residential Complex', 'Penthouse', 'Executive Suites'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setSelectedType(type);
                        setIsTypeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl transition ${
                        selectedType === type ? 'bg-[#0045A5] text-white font-semibold' : 'hover:bg-slate-100 text-[#334155]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-7 bg-[#E2E8F0]" />

            {/* Segment 3: Price Range Dropdown */}
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => {
                  setIsPriceDropdownOpen(!isPriceDropdownOpen);
                  setIsTypeDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl sm:rounded-full bg-slate-50/80 sm:bg-transparent border sm:border-0 border-slate-200/80 text-left text-xs sm:text-sm text-[#0F172A]"
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <DollarSign className="w-4 h-4 text-[#64748B] shrink-0" />
                  <span className="truncate">{selectedPriceRange}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] shrink-0 ml-1" />
              </button>

              {isPriceDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl bg-white border border-slate-200 shadow-xl z-30 text-xs space-y-1 animate-fadeIn">
                  {['All Prices', 'Under KSh 60,000', 'KSh 60,000 - 90,000', 'KSh 90,000 - 150,000', 'KSh 150,000+'].map(price => (
                    <button
                      key={price}
                      type="button"
                      onClick={() => {
                        setSelectedPriceRange(price);
                        setIsPriceDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl transition ${
                        selectedPriceRange === price ? 'bg-[#0045A5] text-white font-semibold' : 'hover:bg-slate-100 text-[#334155]'
                      }`}
                    >
                      {price}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Segment 4: Search Button */}
            <button
              type="submit"
              id="hero-search-submit-btn"
              className="px-6 py-3 rounded-xl sm:rounded-full bg-[#0045A5] hover:bg-[#003882] text-white text-sm font-semibold flex items-center justify-center space-x-2 shadow-xs transition active:scale-95 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </form>

        </div>
      </section>

      {/* --- Properties Showcase Section --- */}
      <section id="section-properties" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0B57D0]">
              Featured Nairobi Portfolio
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Explore Available Residences
            </h2>
            <p className="text-sm text-[#64748B] max-w-xl">
              Upscale residential communities across Kilimani, Westlands, and Kileleshwa with automated M-Pesa tracking.
            </p>
          </div>

          <button
            onClick={() => onOpenAuth('signin')}
            className="inline-flex items-center space-x-2 text-sm font-semibold text-[#0B57D0] hover:underline"
          >
            <span>Landlord Portfolio Access</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {filteredProperties.map(property => {
            const propUnits = units.filter(u => u.propertyId === property.id);
            const occupied = propUnits.filter(u => u.status === 'Occupied').length;
            const avgRent = propUnits.length ? Math.round(propUnits.reduce((acc, u) => acc + u.rentAmount, 0) / propUnits.length) : 75000;

            return (
              <div 
                key={property.id}
                className="group rounded-3xl overflow-hidden bg-white border border-[#E2E8F0] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative h-56 overflow-hidden bg-slate-100">
                  <img
                    src={property.imageUrl}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3.5 left-3.5">
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#0F172A]/85 text-white backdrop-blur-xs">
                      {property.type}
                    </span>
                  </div>
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 flex justify-between items-end text-white">
                    <div className="p-2 rounded-xl bg-black/40 backdrop-blur-xs">
                      <span className="text-[11px] text-slate-200 block">Avg. Rent</span>
                      <span className="font-bold text-sm">{formatKsh(avgRent)}/mo</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-[#0045A5] text-white font-medium">
                      {propUnits.length - occupied} Vacant Units
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold text-[#0F172A] group-hover:text-[#0B57D0] transition">
                      {property.name}
                    </h3>
                    <p className="text-xs text-[#64748B] flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>{property.address}, {property.city}</span>
                    </p>
                    <p className="text-xs text-[#475569] pt-2 line-clamp-2 leading-relaxed">
                      {property.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                    <div className="text-xs text-[#64748B]">
                      <strong>{propUnits.length}</strong> Total Units
                    </div>
                    <button
                      onClick={() => onOpenAuth('signin')}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#0045A5] hover:text-white text-[#0F172A] text-xs font-semibold transition flex items-center space-x-1.5"
                    >
                      <span>Resident Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- Services / Value Proposition Section --- */}
      <section id="section-services" className="bg-[#F8FAFC] py-20 px-4 sm:px-6 lg:px-8 border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0B57D0]">
              End-To-End Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Designed For Modern Property Operations
            </h2>
            <p className="text-sm text-[#64748B]">
              Say goodbye to scattered WhatsApp groups and manual rent reconciliations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0B57D0]/10 text-[#0B57D0] flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                Instant M-Pesa Rent Tracking
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Direct Safaricom Paybill integration with automated resident receipts, dynamic balance calculation, and payment status indicators.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0045A5]/10 text-[#0045A5] flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                Multimodal Gemini AI Vision
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Residents upload photos of leaks, electrical faults, or damaged fixtures. AI models instantly diagnose severity and estimate repairs in KSh.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                1-Click WhatsApp Fundi Dispatch
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Generate pre-formatted work orders directly to certified Nairobi plumbers, electricians, and carpenters with tenant entry permissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- About Section --- */}
      <section id="section-about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0B57D0]">
              About PlotiSmarta
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
              Simplifying Property Management Across Kenya
            </h2>
            <p className="text-sm text-[#475569] leading-relaxed">
              PlotiSmarta bridges the gap between estate managers, landlords, and residents. Built with high-performance Go micro-services and intuitive interfaces, our platform brings clarity, accountability, and effortless living to Nairobi properties.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-2xl font-extrabold text-[#0045A5]">100%</div>
                <div className="text-xs text-[#64748B]">M-Pesa Supported</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-2xl font-extrabold text-[#0B57D0]">&lt; 2 hrs</div>
                <div className="text-xs text-[#64748B]">Average Repair Triage</div>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80"
              alt="Apartment building"
              className="w-full h-80 sm:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent flex items-end p-8 text-white">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-300 font-semibold">Nairobi Prime Portfolio</p>
                <h4 className="text-lg font-bold">Kilimani, Westlands, and Kileleshwa</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Contact & Support Section --- */}
      <section id="section-contact" className="bg-[#F8FAFC] py-20 px-4 sm:px-6 lg:px-8 border-t border-[#E2E8F0]">
        <div className="max-w-3xl mx-auto space-y-8 text-center">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0B57D0]">
              Get in Touch
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F172A]">
              Have Questions or Want to List a Property?
            </h2>
            <p className="text-sm text-[#64748B]">
              Our Nairobi concierge team is on standby to assist property owners and residents.
            </p>
          </div>

          {isContactSubmitted ? (
            <div className="p-6 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] space-y-2 animate-fadeIn">
              <CheckCircle2 className="w-8 h-8 mx-auto text-[#059669]" />
              <h4 className="font-bold text-sm">Message Sent Successfully</h4>
              <p className="text-xs">Thank you! A representative will reach out via WhatsApp / Email shortly.</p>
            </div>
          ) : (
            <form 
              onSubmit={e => {
                e.preventDefault();
                setIsContactSubmitted(true);
              }}
              className="p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm space-y-4 text-left text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#475569] mb-1">Your Name</label>
                  <input required type="text" placeholder="e.g. John Kamau" className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] focus:border-[#0045A5] focus:outline-hidden" />
                </div>
                <div>
                  <label className="block font-semibold text-[#475569] mb-1">Phone Number</label>
                  <input required type="tel" placeholder="+254 7..." className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] focus:border-[#0045A5] focus:outline-hidden" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-[#475569] mb-1">Email Address</label>
                <input required type="email" placeholder="john@example.com" className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] focus:border-[#0045A5] focus:outline-hidden" />
              </div>
              <div>
                <label className="block font-semibold text-[#475569] mb-1">Message</label>
                <textarea required rows={3} placeholder="How can we help you?" className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] focus:border-[#0045A5] focus:outline-hidden" />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0045A5] hover:bg-[#003882] text-white font-semibold text-sm transition"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </section>

      {/* --- Footer matching reference exactly --- */}
      <footer className="bg-[#E7EBEE] border-t border-[#D5DEE5] text-[#334155] py-14 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          
          {/* Col 1: Brand & Copyright */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-md bg-[#0045A5] text-white flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-[#0F172A]">
                PlotiSmarta
              </span>
            </div>
            <p className="text-[#64748B] text-[11px] leading-relaxed max-w-xs">
              © 2024 PlotiSmarta Management Systems. All rights reserved.
            </p>
          </div>

          {/* Col 2: Sitemap & Privacy */}
          <div className="space-y-2.5">
            <p 
              onClick={() => scrollToSection('section-properties', 'properties')}
              className="cursor-pointer hover:text-[#0B57D0] transition font-medium"
            >
              Sitemap
            </p>
            <p 
              onClick={() => scrollToSection('section-about', 'about')}
              className="cursor-pointer hover:text-[#0B57D0] transition font-medium"
            >
              Privacy Policy
            </p>
          </div>

          {/* Col 3: Terms & Cookies */}
          <div className="space-y-2.5">
            <p 
              onClick={() => scrollToSection('section-about', 'about')}
              className="cursor-pointer hover:text-[#0B57D0] transition font-medium"
            >
              Terms of Service
            </p>
            <p 
              onClick={() => scrollToSection('section-about', 'about')}
              className="cursor-pointer hover:text-[#0B57D0] transition font-medium"
            >
              Cookies
            </p>
          </div>

          {/* Col 4: Support & Careers */}
          <div className="space-y-2.5">
            <p 
              onClick={() => scrollToSection('section-contact', 'contact')}
              className="cursor-pointer hover:text-[#0B57D0] transition font-medium"
            >
              Contact Support
            </p>
            <p 
              onClick={() => scrollToSection('section-about', 'about')}
              className="cursor-pointer hover:text-[#0B57D0] transition font-medium"
            >
              Careers
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
};
