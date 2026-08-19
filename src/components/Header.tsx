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
      badgeColor: stats.emergencyIssues > 0 ? 'bg-[#D17A5E] text-white' : 'bg-[#FAF4EB] text-[#C28B38]'
    },
    { id: 'properties', label: 'Properties & Units', icon: Building2 },
    { id: 'tenants', label: 'Resident Directory', icon: Users }
  ];

  const isLandlord = currentUser?.role === 'landlord';

  return (
    <header className="sticky top-0 z-30 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#EDE8DF]/90 text-[#2C362C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#2C362C] flex items-center justify-center text-[#E5E1D8] shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-lg tracking-tight text-[#2C362C]">Haven</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#F2EFEA] text-[#5A6D5A]">
                  Kenya
                </span>
                {isBackendOnline && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-[#E8F2E8] text-[#3D783D] hidden sm:inline-block">
                    Go API Active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center Badge: For Landlord, shows switcher; for Resident, shows their apartment location */}
          {isLandlord ? (
            <div className="flex items-center bg-[#F2EFEA] p-1 rounded-xl">
              <button
                id="switch-landlord-mode-btn"
                onClick={() => setViewMode('landlord')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'landlord'
                    ? 'bg-white text-[#2C362C] shadow-xs'
                    : 'text-[#8C8880] hover:text-[#2C362C]'
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
                    ? 'bg-[#5A6D5A] text-white shadow-xs'
                    : 'text-[#8C8880] hover:text-[#2C362C]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Resident Preview</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#EDE8DF] text-xs">
              <Home className="w-3.5 h-3.5 text-[#5A6D5A]" />
              <span className="font-semibold text-[#2C362C]">
                {currentUser?.propertyName?.split(' ')[0]} • Unit {currentUser?.unitNumber}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#F2F6F2] text-[#4A5D4A]">
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
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[#D17A5E] hover:bg-[#c26e54] text-white shadow-xs transition active:scale-95"
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
                className="p-2 text-[#8C8880] hover:text-[#2C362C] hover:bg-[#F5F2EC] rounded-xl transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* User Profile / Switcher Dropdown */}
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-xl bg-white border border-[#EDE8DF] hover:border-[#5A6D5A]/40 transition shadow-2xs"
              >
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#EAE5DC] flex items-center justify-center font-bold text-xs text-[#2C362C]">
                    {currentUser?.name?.[0] || 'U'}
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left leading-tight pr-1">
                  <span className="text-xs font-semibold text-[#2C362C] max-w-[110px] truncate">
                    {currentUser?.name}
                  </span>
                  <span className="text-[10px] text-[#8C8880]">
                    {currentUser?.role === 'landlord' ? 'Landlord' : `Unit ${currentUser?.unitNumber}`}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-[#8C8880]" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div 
                  id="user-profile-dropdown"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#EDE8DF] shadow-xl p-3 space-y-2 z-50 animate-fadeIn"
                >
                  <div className="px-2 py-1.5 border-b border-[#F5F2EC]">
                    <p className="text-xs font-bold text-[#2C362C] truncate">{currentUser?.name}</p>
                    <p className="text-[11px] text-[#8C8880] truncate">{currentUser?.email}</p>
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F2F6F2] text-[#4A5D4A] mt-1">
                      {currentUser?.role === 'landlord' ? 'Landlord / Manager' : `Resident (${currentUser?.propertyName?.split(' ')[0]} ${currentUser?.unitNumber})`}
                    </span>
                  </div>

                  {/* Switch Persona Options */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880] px-2 pt-1">
                      Switch Demo Profile
                    </p>
                    {DEMO_USERS.map(u => (
                      <button
                        key={u.id}
                        onClick={() => login(u)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition ${
                          currentUser?.id === u.id
                            ? 'bg-[#FAF8F5] text-[#2C362C] font-semibold'
                            : 'text-[#555555] hover:bg-[#F5F2EC]'
                        }`}
                      >
                        <span className="truncate">{u.name} ({u.role === 'landlord' ? 'Landlord' : u.unitNumber})</span>
                        {currentUser?.id === u.id && <UserCheck className="w-3.5 h-3.5 text-[#5A6D5A]" />}
                      </button>
                    ))}
                  </div>

                  <div className="pt-1 border-t border-[#F5F2EC]">
                    <button
                      id="header-logout-btn"
                      onClick={logout}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-[#D17A5E] hover:bg-[#FBF1EE] font-semibold flex items-center space-x-1.5 transition"
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
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#FBF1EE] text-[#8C8880] hover:text-[#D17A5E] border border-[#EDE8DF] hover:border-[#D17A5E]/30 transition shadow-2xs active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5 text-[#D17A5E]" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>

        {/* Landlord Navigation Sub-Tabs (Strictly only shown when Landlord is logged in AND in landlord mode) */}
        {isLandlord && viewMode === 'landlord' && (
          <nav className="flex space-x-1 overflow-x-auto py-1.5 border-t border-[#EDE8DF]/80 no-scrollbar">
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
                      ? 'bg-white text-[#2C362C] font-semibold shadow-xs'
                      : 'text-[#8C8880] hover:text-[#2C362C] hover:bg-[#F5F2EC]/60 font-medium'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#4A5D4A]' : 'text-[#8C8880]'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${item.badgeColor || 'bg-[#F2EFEA] text-[#2C362C]'}`}>
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
