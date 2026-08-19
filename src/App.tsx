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

  // Detect QR code / deep link params on load
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('portal') === 'tenant-portal' || searchParams.has('report') || searchParams.has('unit')) {
        setViewMode('tenant-portal');
        if (!currentUser) {
          // Default to first tenant demo user
          login(DEMO_USERS[1]);
        }
      }
    } catch (e) {
      console.warn('URL param parse error:', e);
    }
  }, [setViewMode, currentUser, login]);

  // If not logged in, render the Login Page
  if (!currentUser) {
    return <LoginPage />;
  }

  const isTenantView = currentUser.role === 'tenant' || viewMode === 'tenant-portal';

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C362C] antialiased flex flex-col font-sans selection:bg-[#5A6D5A] selection:text-white">
      {/* Top Global Navigation Bar */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7">
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
      <footer className="mt-auto border-t border-[#EDE8DF] bg-[#FAF8F5] py-6 text-center text-xs text-[#8C8880]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-bold text-[#2C362C]">Haven Kenya</span>
            <span>•</span>
            <span>Natural Apartment & Property OS (Nairobi)</span>
          </div>
          <p className="text-[#8C8880]">
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
          className="fixed inset-0 z-50 bg-[#2C362C]/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
        >
          <div 
            id="report-modal-dialog"
            onClick={e => e.stopPropagation()}
            className="bg-[#FDFBF7] border border-[#EDE8DF] rounded-[32px] max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl my-auto animate-fadeIn text-[#2C362C]"
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
