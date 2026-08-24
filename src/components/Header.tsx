import React, { useState } from 'react';
import { 
  Building2, 
  Wrench, 
  Users, 
  LayoutDashboard, 
  PlusCircle, 
  QrCode, 
  RotateCcw,
  Camera,
  ShieldCheck,
  Smartphone,
  LogOut,
  ChevronDown,
  UserCheck,
  Home
} from 'lucide-react';
import { useProperty } from '../context/PropertyContext';
import { ActiveTab, UserRole } from '../types';
import { DEMO_USERS } from '../data/mockData';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    login, 
    logout, 
    activeTab, 
    setActiveTab, 
    viewMode, 
    setViewMode, 
    stats, 
    setIsReportModalOpen, 
    resetToDemoData, 
    isBackendOnline 
  } = useProperty();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: number; badgeColor?: string }[] = [
    { id: 'overview', label: 'Portfolio Overview', icon: LayoutDashboard },
    { 
      id: 'maintenance', 
      label: 'Maintenance & Fundis', 
      icon: Wrench, 
      badge: stats.openIssues,
      badgeColor: stats.emergencyIssues > 0 ? 'bg-rose-500 text-white' : 'bg-blue-50 text-[#0045A5] border border-blue-200'
    },
    { id: 'properties', label: 'Properties & Units', icon: Building2 },
    { id: 'tenants', label: 'Resident Directory', icon: Users }
  ];

  const isLandlord = currentUser?.role === 'landlord';

  return (
    <header className="sticky top-0 z-30 glass-header text-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#0045A5] text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-[#0F172A]">PlotiSmarta</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-white/70 border border-[#CBD5E1] text-[#0045A5]">
                  Kenya
                </span>
                {isBackendOnline && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-[#E8F2E8]/80 text-[#3D783D] border border-[#3D783D]/20 hidden sm:inline-block">
                    Go API Active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center Badge: For Landlord, shows switcher; for Resident, shows their apartment location */}
          {isLandlord ? (
            <div className="flex items-center glass-pill p-1 rounded-xl">
              <button
                id="switch-landlord-mode-btn"
                onClick={() => setViewMode('landlord')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'landlord'
                    ? 'bg-[#0045A5] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Landlord Admin</span>
              </button>
              <button
                id="switch-tenant-mode-btn"
                onClick={() => setViewMode('tenant-portal')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'tenant-portal'
                    ? 'bg-[#0045A5] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Resident Preview</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-pill text-xs">
              <Home className="w-3.5 h-3.5 text-[#0045A5]" />
              <span className="font-semibold text-[#0F172A]">
                {currentUser?.propertyName?.split(' ')[0]} • Unit {currentUser?.unitNumber}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#EFF6FF] text-[#0045A5] border border-[#BFDBFE]">
                Resident Portal
              </span>
            </div>
          )}

          {/* Right Action & User Profile Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Report Breakage Button */}
            <button
              id="header-report-breakage-btn"
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[#0045A5] hover:bg-[#003882] text-white shadow-xs transition active:scale-95"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Report Breakage</span>
            </button>

            {/* Reset Demo Data (Visible to Landlord) */}
            {isLandlord && (
              <button
                id="reset-demo-btn"
                onClick={resetToDemoData}
                title="Reset Kenyan demo database"
                className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* User Profile / Switcher Dropdown */}
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-xl glass-pill hover:border-[#0045A5]/40 transition shadow-2xs"
              >
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-[#CBD5E1]"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#EFF6FF] flex items-center justify-center font-bold text-xs text-[#0045A5]">
                    {currentUser?.name?.[0] || 'U'}
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left leading-tight pr-1">
                  <span className="text-xs font-semibold text-[#0F172A] max-w-[110px] truncate">
                    {currentUser?.name}
                  </span>
                  <span className="text-[10px] text-[#64748B]">
                    {currentUser?.role === 'landlord' ? 'Landlord' : `Unit ${currentUser?.unitNumber}`}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div 
                  id="user-profile-dropdown"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="absolute right-0 mt-2 w-64 rounded-2xl glass-modal p-3 space-y-2 z-50 animate-fadeIn border border-slate-200"
                >
                  <div className="px-2 py-1.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-[#0F172A] truncate">{currentUser?.name}</p>
                    <p className="text-[11px] text-[#64748B] truncate">{currentUser?.email}</p>
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#0045A5] mt-1 border border-[#BFDBFE]">
                      {currentUser?.role === 'landlord' ? 'Landlord / Manager' : `Resident (${currentUser?.propertyName?.split(' ')[0]} ${currentUser?.unitNumber})`}
                    </span>
                  </div>

                  {/* Switch Persona Options */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] px-2 pt-1">
                      Switch Demo Profile
                    </p>
                    {DEMO_USERS.map(u => (
                      <button
                        key={u.id}
                        onClick={() => login(u)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition ${
                          currentUser?.id === u.id
                            ? 'bg-[#EFF6FF] text-[#0045A5] font-semibold'
                            : 'text-[#475569] hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{u.name} ({u.role === 'landlord' ? 'Landlord' : u.unitNumber})</span>
                        {currentUser?.id === u.id && <UserCheck className="w-3.5 h-3.5 text-[#0045A5]" />}
                      </button>
                    ))}
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      id="header-logout-btn"
                      onClick={logout}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-semibold flex items-center space-x-1.5 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick 1-Click Direct Logout Button */}
            <button
              id="header-direct-logout-btn"
              onClick={logout}
              title="Log out completely and return to Login screen"
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-[#64748B] hover:text-rose-600 border border-[#E2E8F0] hover:border-rose-200 transition shadow-2xs active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>

        {/* Landlord Navigation Sub-Tabs (Strictly only shown when Landlord is logged in AND in landlord mode) */}
        {isLandlord && viewMode === 'landlord' && (
          <nav className="flex space-x-1 overflow-x-auto py-1.5 border-t border-[#E2E8F0] no-scrollbar">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#0045A5] text-white font-semibold shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 font-medium'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : (item.badgeColor || 'bg-slate-100 text-[#0F172A]')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
};
