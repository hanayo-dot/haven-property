import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Smartphone, 
  ArrowRight, 
  Sparkles, 
  KeyRound, 
  User as UserIcon, 
  Lock, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  Users 
} from 'lucide-react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { useProperty } from '../context/PropertyContext';

export const LoginPage: React.FC = () => {
  const { login } = useProperty();
  const [selectedRole, setSelectedRole] = useState<UserRole>('landlord');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  const landlordUsers = DEMO_USERS.filter(u => u.role === 'landlord');
  const tenantUsers = DEMO_USERS.filter(u => u.role === 'tenant');

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: customName || (selectedRole === 'landlord' ? 'Property Manager' : 'Resident'),
      email: customEmail,
      phone: '+254 700 000 000',
      role: selectedRole,
      propertyName: selectedRole === 'tenant' ? 'Kilimani Heights Apartments' : undefined,
      unitNumber: selectedRole === 'tenant' ? '3B' : undefined,
      rentAmount: selectedRole === 'tenant' ? 75000 : undefined
    };

    login(newUser);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C362C] flex flex-col justify-between selection:bg-[#5A6D5A] selection:text-white">
      
      {/* Top Simple Brand Bar */}
      <header className="px-6 sm:px-10 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2C362C] text-[#E5E1D8] flex items-center justify-center shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif font-bold text-xl tracking-tight text-[#2C362C]">Haven</span>
            <span className="text-[10px] ml-2 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#F2EFEA] text-[#5A6D5A]">
              Kenya OS
            </span>
          </div>
        </div>

        <div className="text-xs text-[#8C8880] font-medium hidden sm:block">
          Nairobi • Kilimani • Westlands • Kileleshwa
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white border border-[#EDE8DF] rounded-[36px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden">
          
          <div className="p-7 sm:p-10 space-y-8">
            
            {/* Header Text */}
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-[#F2F6F2] text-[#4A5D4A]">
                Welcome to Haven Kenya
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif text-[#2C362C] tracking-tight">
                Select Your Portal & Sign In
              </h1>
              <p className="text-xs sm:text-sm text-[#8C8880]">
                Choose your role to access either the Landlord Portfolio Operations or Resident M-Pesa & Maintenance Hub.
              </p>
            </div>

            {/* Quick 1-Click Persona Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-[#8C8880] px-1">
                <span>Quick 1-Click Demo Profiles</span>
                <span className="text-[11px] text-[#4A5D4A]">Instant Access (No Password Required)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Landlord Card */}
                {landlordUsers.map(user => (
                  <div
                    key={user.id}
                    onClick={() => login(user)}
                    className="group p-6 rounded-[28px] bg-gradient-to-br from-[#2E3B2E] via-[#243024] to-[#1D271D] text-white cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all duration-200 space-y-4 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex items-center space-x-3.5">
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white/30 shadow-xs"
                        />
                        <div>
                          <h3 className="font-serif font-bold text-base text-white group-hover:text-[#D1DCD1] transition">
                            {user.name}
                          </h3>
                          <p className="text-xs text-[#A8B6A8]">
                            Property Manager & Landlord
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/15 text-white backdrop-blur-xs">
                        Admin
                      </span>
                    </div>

                    <div className="text-xs text-[#D1DCD1] relative z-10 space-y-1 pt-1 border-t border-white/10">
                      <div className="flex items-center space-x-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#C4D0C4]" />
                        <span>3 Properties (Kilimani, Westlands, Kileleshwa)</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#C4D0C4]" />
                        <span>KSh 1.4M/mo Revenue • Fundi Dispatch • AI Triage</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#E5E1D8] relative z-10">
                      <span>Login as Landlord</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                    </div>

                    {/* Subtle water mark */}
                    <ShieldCheck className="w-32 h-32 absolute -right-6 -bottom-6 text-white/5 pointer-events-none" />
                  </div>
                ))}

                {/* Resident Card 1 (Juma Ochieng) */}
                <div
                  onClick={() => login(tenantUsers[0])}
                  className="group p-6 rounded-[28px] bg-[#FAF8F5] border border-[#EDE8DF] hover:border-[#5A6D5A] hover:shadow-lg hover:scale-[1.01] transition-all duration-200 cursor-pointer space-y-4 relative"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={tenantUsers[0].avatarUrl}
                        alt={tenantUsers[0].name}
                        className="w-12 h-12 rounded-full object-cover border border-[#EDE8DF]"
                      />
                      <div>
                        <h3 className="font-serif font-bold text-base text-[#2C362C] group-hover:text-[#4A5D4A] transition">
                          {tenantUsers[0].name}
                        </h3>
                        <p className="text-xs text-[#8C8880]">
                          Resident • {tenantUsers[0].propertyName} (Unit {tenantUsers[0].unitNumber})
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F2F6F2] text-[#4A5D4A]">
                      Resident
                    </span>
                  </div>

                  <div className="text-xs text-[#555555] space-y-1 pt-1 border-t border-[#F5F2EC]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8C8880]">Rent:</span>
                      <span className="font-semibold text-[#2C362C]">KSh {tenantUsers[0].rentAmount?.toLocaleString()} / mo</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8C8880]">M-Pesa Account:</span>
                      <span className="font-mono font-semibold text-[#4A5D4A]">{tenantUsers[0].mpesaAccount}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#4A5D4A]">
                    <span>Login as Resident (Kilimani 4B)</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                  </div>
                </div>

              </div>

              {/* Other Tenants Bar */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EDE8DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="text-[#8C8880] font-medium">
                  Other Demo Residents:
                </span>
                <div className="flex flex-wrap gap-2">
                  {tenantUsers.slice(1).map(tenant => (
                    <button
                      key={tenant.id}
                      onClick={() => login(tenant)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F2EFEA] text-[#2C362C] border border-[#EDE8DF] font-semibold transition flex items-center space-x-1.5 shadow-2xs"
                    >
                      <img src={tenant.avatarUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                      <span>{tenant.name} ({tenant.propertyName?.split(' ')[0]} {tenant.unitNumber})</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Custom Sign In Accordion */}
            <div className="pt-4 border-t border-[#F5F2EC] space-y-4">
              <div className="text-center">
                <p className="text-xs font-medium text-[#8C8880]">
                  Or enter your email to access your account:
                </p>
              </div>

              <form onSubmit={handleCustomLogin} className="max-w-md mx-auto space-y-3">
                <div className="flex items-center justify-center space-x-2 bg-[#FAF8F5] p-1 rounded-xl border border-[#EDE8DF]">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('landlord')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedRole === 'landlord'
                        ? 'bg-[#2C362C] text-white shadow-xs'
                        : 'text-[#8C8880] hover:text-[#2C362C]'
                    }`}
                  >
                    Landlord / Manager
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('tenant')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedRole === 'tenant'
                        ? 'bg-[#5A6D5A] text-white shadow-xs'
                        : 'text-[#8C8880] hover:text-[#2C362C]'
                    }`}
                  >
                    Apartment Resident
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-[#EDE8DF] bg-[#FAF8F5] px-3.5 py-2.5 focus:bg-white focus:outline-none"
                />

                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={customEmail}
                  onChange={e => setCustomEmail(e.target.value)}
                  className="w-full text-xs rounded-xl border border-[#EDE8DF] bg-[#FAF8F5] px-3.5 py-2.5 focus:bg-white focus:outline-none"
                />

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#5A6D5A] hover:bg-[#4D5E4D] text-white font-semibold text-xs shadow-xs transition"
                >
                  Sign In as {selectedRole === 'landlord' ? 'Landlord' : 'Resident'}
                </button>
              </form>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-[#8C8880]">
        Haven Property Management OS • Kenya Edition • Fast M-Pesa & Multimodal AI Diagnostics
      </footer>

    </div>
  );
};
