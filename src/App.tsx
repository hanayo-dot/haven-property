import React, { useEffect } from 'react';
import { PropertyProvider, useProperty } from './context/PropertyContext';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { DashboardOverview } from './components/DashboardOverview';
import { MaintenanceHub } from './components/MaintenanceHub';
import { PropertiesView } from './components/PropertiesView';
import { TenantsView } from './components/TenantsView';
import { TenantDashboard } from './components/TenantDashboard';
import { MaintenanceDetailModal } from './components/MaintenanceDetailModal';
import { PhotoViewerModal } from './components/PhotoViewerModal';
import { TenantReportPortal } from './components/TenantReportPortal';
import { NewPropertyModal } from './components/NewPropertyModal';
import { TenantLinkModal } from './components/TenantLinkModal';
import { LandingPage } from './components/LandingPage';
import { DEMO_USERS } from './data/mockData';

const MainAppContent: React.FC = () => {
  const { 
    currentUser,
    login,
    viewMode, 
    setViewMode, 
    activeTab, 
    isReportModalOpen, 
    setIsReportModalOpen 
  } = useProperty();

  const [authModalMode, setAuthModalMode] = React.useState<'signin' | 'signup' | null>(null);

  // Detect QR code / deep link params on load if already authenticated
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('portal') === 'tenant-portal' || searchParams.has('report') || searchParams.has('unit')) {
        setViewMode('tenant-portal');
      }
    } catch (e) {
      console.warn('URL param parse error:', e);
    }
  }, [setViewMode]);

  // If not logged in, render the PlotiSmarta Landing Page with modal login
  if (!currentUser) {
    return (
      <>
        <LandingPage onOpenAuth={(mode) => setAuthModalMode(mode)} />
        {authModalMode && (
          <LoginPage 
            isModal 
            initialMode={authModalMode} 
            onClose={() => setAuthModalMode(null)} 
          />
        )}
      </>
    );
  }

  const isTenantView = currentUser.role === 'tenant' || viewMode === 'tenant-portal';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] antialiased flex flex-col font-sans selection:bg-[#0045A5] selection:text-white relative overflow-hidden">
      {/* Subtle Ambient Mesh Glows for Glassmorphism Depth */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />
      <div className="ambient-glow-3" />

      {/* Top Global Navigation Bar */}
      <Header />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7">
        {isTenantView ? (
          /* Dedicated Kenyan Resident Dashboard & M-Pesa Hub */
          <div className="animate-fadeIn">
            <TenantDashboard />
          </div>
        ) : (
          /* Landlord Mode Tabs */
          <div className="animate-fadeIn">
            {activeTab === 'overview' && <DashboardOverview />}
            {activeTab === 'maintenance' && <MaintenanceHub />}
            {activeTab === 'properties' && <PropertiesView />}
            {activeTab === 'tenants' && <TenantsView />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E2E8F0] bg-white/80 backdrop-blur-md py-6 text-center text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#0F172A]">PlotiSmarta Kenya</span>
            <span>•</span>
            <span>Modern Property Operations & Resident Portal</span>
          </div>
          <p className="text-[#64748B]">
            M-Pesa Rent Tracking • Multimodal Gemini AI Triage • WhatsApp Fundi Dispatch
          </p>
        </div>
      </footer>

      {/* Global Modals & Drawers */}
      <MaintenanceDetailModal />
      <PhotoViewerModal />
      <NewPropertyModal />
      <TenantLinkModal />

      {/* Breakage Report Modal (Triggered via Quick Header button) */}
      {isReportModalOpen && (
        <div 
          id="report-modal-backdrop"
          onClick={() => setIsReportModalOpen(false)}
          className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
        >
          <div 
            id="report-modal-dialog"
            onClick={e => e.stopPropagation()}
            className="glass-modal rounded-[32px] max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl my-auto animate-fadeIn text-[#1E293B] border border-white/90"
          >
            <TenantReportPortal isModal onClose={() => setIsReportModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <PropertyProvider>
      <MainAppContent />
    </PropertyProvider>
  );
}
