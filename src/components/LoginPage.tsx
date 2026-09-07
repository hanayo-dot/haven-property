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
  Users,
  Mail,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  UserPlus,
  Home,
  X
} from 'lucide-react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { useProperty } from '../context/PropertyContext';

interface LoginPageProps {
  initialMode?: 'signin' | 'signup';
  isModal?: boolean;
  onClose?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  initialMode = 'signin', 
  isModal = false, 
  onClose 
}) => {
  const { login, register, authError, clearAuthError, properties } = useProperty();
  
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialMode);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('haven2026');
  const [showPassword, setShowPassword] = useState(false);
  const [roleHint, setRoleHint] = useState<UserRole>('tenant');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Sign up state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+254 7');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('tenant');
  const [regPropertyId, setRegPropertyId] = useState(properties[0]?.id || 'prop-1');
  const [regUnitNumber, setRegUnitNumber] = useState('4A');

  const landlordUsers = DEMO_USERS.filter(u => u.role === 'landlord');
  const tenantUsers = DEMO_USERS.filter(u => u.role === 'tenant');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setLocalError(null);

    if (!identifier.trim()) {
      setLocalError('Please enter your email address or Kenyan phone number.');
      return;
    }

    setIsLoading(true);
    try {
      await login(identifier, password, roleHint);
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setLocalError(null);

    if (!regName.trim()) {
      setLocalError('Please provide your full name.');
      return;
    }
    if (!regEmail.trim() && !regPhone.trim()) {
      setLocalError('Please provide either an email or a valid Kenyan phone number (+254...).');
      return;
    }

    setIsLoading(true);
    try {
      const selectedProp = properties.find(p => p.id === regPropertyId);
      await register({
        name: regName.trim(),
        email: regEmail.trim() || `${regName.toLowerCase().replace(/\s+/g, '.')}@plotismarta.co.ke`,
        phone: regPhone.trim() || '+254 700 000 000',
        password: regPassword || 'haven2026',
        role: regRole,
        propertyId: regRole === 'tenant' ? regPropertyId : undefined,
        propertyName: regRole === 'tenant' ? selectedProp?.name : undefined,
        unitNumber: regRole === 'tenant' ? regUnitNumber : undefined,
        avatarUrl: regRole === 'landlord'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      });
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickPreset = (user: User) => {
    setIdentifier(user.email || user.phone);
    setPassword('haven2026');
    setRoleHint(user.role);
    clearAuthError();
    setLocalError(null);
  };

  const content = (
    <div className="relative glass-modal rounded-[36px] overflow-hidden border border-white/90 shadow-2xl">
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition z-20"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="p-7 sm:p-10 space-y-8">
        
        {/* Header Text */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0045A5] backdrop-blur-xs">
            Secure Kenyan Property Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            {authMode === 'signin' ? 'Sign In to Your Account' : 'Create an Account'}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            {authMode === 'signin' 
              ? 'Enter your email address or Kenyan phone number (+254 / 07...) to access your dedicated portal.'
              : 'Register as a Resident or Landlord with Nairobi property linking.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex justify-center">
          <div className="glass-pill p-1 rounded-2xl inline-flex space-x-1 border border-slate-200">
            <button
              type="button"
              id="tab-signin-btn"
              onClick={() => {
                setAuthMode('signin');
                setLocalError(null);
                clearAuthError();
              }}
              className={`px-6 py-2 rounded-xl text-xs font-semibold transition ${
                authMode === 'signin'
                  ? 'bg-[#0045A5] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              id="tab-signup-btn"
              onClick={() => {
                setAuthMode('signup');
                setLocalError(null);
                clearAuthError();
              }}
              className={`px-6 py-2 rounded-xl text-xs font-semibold transition ${
                authMode === 'signup'
                  ? 'bg-[#0045A5] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Error Message Display */}
        {(localError || authError) && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="flex-1 font-medium">{localError || authError}</p>
          </div>
        )}

        {/* Form Container */}
        {authMode === 'signin' ? (
          /* Sign In Form */
          <form onSubmit={handleSignIn} className="space-y-4 max-w-md mx-auto">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                Email Address or Mobile Phone Number *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  id="login-identifier-input"
                  type="text"
                  required
                  placeholder="e.g. juma@havenresident.co.ke or +254 712 345 678"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 glass-input rounded-2xl text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                  Password *
                </label>
                <span className="text-[11px] text-[#64748B]">Default: <strong>haven2026</strong></span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 glass-input rounded-2xl text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#0F172A]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                Role Context
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRoleHint('tenant')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                    roleHint === 'tenant'
                      ? 'border-[#0045A5] bg-[#0045A5] text-white shadow-xs'
                      : 'border-slate-200 glass-pill text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Resident Portal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoleHint('landlord')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                    roleHint === 'landlord'
                      ? 'border-[#0045A5] bg-[#0045A5] text-white shadow-xs'
                      : 'border-slate-200 glass-pill text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Landlord OS</span>
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#0045A5] hover:bg-[#003882] text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-md transition active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating with Go API...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignUp} className="space-y-4 max-w-lg mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brian Kiprono"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-[#0F172A] placeholder-[#94A3B8] focus:bg-white focus:border-[#0045A5] focus:outline-hidden transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="brian@example.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-[#0F172A] placeholder-[#94A3B8] focus:bg-white focus:border-[#0045A5] focus:outline-hidden transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                  Kenyan Mobile Phone (+254)
                </label>
                <input
                  type="tel"
                  placeholder="+254 712 345 678"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-[#0F172A] placeholder-[#94A3B8] focus:bg-white focus:border-[#0045A5] focus:outline-hidden transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                  Password (optional, default: haven2026)
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-[#0F172A] placeholder-[#94A3B8] focus:bg-white focus:border-[#0045A5] focus:outline-hidden transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                  Select Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('tenant')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                      regRole === 'tenant'
                        ? 'border-[#0045A5] bg-[#0045A5] text-white'
                        : 'border-slate-200 bg-slate-50 text-[#64748B]'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Resident (Tenant)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('landlord')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                      regRole === 'landlord'
                        ? 'border-[#0045A5] bg-[#0045A5] text-white'
                        : 'border-slate-200 bg-slate-50 text-[#64748B]'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Landlord / Estate Owner</span>
                  </button>
                </div>
              </div>

              {regRole === 'tenant' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                      Nairobi Building *
                    </label>
                    <select
                      value={regPropertyId}
                      onChange={e => setRegPropertyId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-[#0F172A] focus:border-[#0045A5] focus:outline-hidden"
                    >
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.state})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                      Apartment Unit # *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 4B"
                      value={regUnitNumber}
                      onChange={e => setRegUnitNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-[#0F172A] focus:border-[#0045A5] focus:outline-hidden"
                    />
                  </div>
                </>
              )}
            </div>

            <button
              id="signup-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#0045A5] hover:bg-[#003882] text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-sm transition active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering user with Go Backend...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account & Log In</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* 1-Click Fast-Test Kenyan Profiles */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0045A5]" />
              <span>1-Click Test Personas (Preloaded in Nairobi)</span>
            </span>
            <span className="text-[11px] text-[#94A3B8]">Click any avatar to populate</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Landlord Card */}
            {landlordUsers.map(user => (
              <button
                key={user.id}
                type="button"
                onClick={() => fillQuickPreset(user)}
                className="p-3.5 rounded-2xl glass-card glass-card-hover text-left transition group border border-slate-200/80"
              >
                <div className="flex items-center space-x-2.5">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-white"
                  />
                  <div className="overflow-hidden">
                    <div className="flex items-center space-x-1.5">
                      <p className="text-xs font-bold text-[#0F172A] truncate">{user.name}</p>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase bg-[#0045A5] text-white">
                        Landlord
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] truncate">{user.email}</p>
                    <p className="text-[10px] text-[#0045A5] font-mono">{user.phone}</p>
                  </div>
                </div>
              </button>
            ))}

            {/* Resident Cards */}
            {tenantUsers.slice(0, 5).map(user => (
              <button
                key={user.id}
                type="button"
                onClick={() => fillQuickPreset(user)}
                className="p-3.5 rounded-2xl glass-card glass-card-hover text-left transition group border border-slate-200/80"
              >
                <div className="flex items-center space-x-2.5">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-white"
                  />
                  <div className="overflow-hidden">
                    <div className="flex items-center space-x-1.5">
                      <p className="text-xs font-bold text-[#0F172A] truncate">{user.name}</p>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase bg-blue-50 text-[#0045A5] border border-blue-200">
                        Apt {user.unitNumber}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] truncate">{user.email}</p>
                    <p className="text-[10px] text-[#0045A5] font-mono">{user.phone}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Footer Info Strip */}
      <div className="bg-slate-50 border-t border-slate-200 px-8 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-2">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#0045A5]" />
          <span>Full session persistence enabled with Go file-backed JSON database</span>
        </div>
        <div className="text-[11px]">
          Currency: <strong>KSh (Kenyan Shillings)</strong> • M-Pesa Integrated
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div 
        onClick={onClose}
        className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
      >
        <div 
          onClick={e => e.stopPropagation()}
          className="max-w-4xl w-full my-auto"
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col justify-between selection:bg-[#0045A5] selection:text-white relative overflow-hidden">
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />
      <div className="ambient-glow-3" />

      <header className="relative z-10 px-6 sm:px-10 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0045A5] text-white flex items-center justify-center shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-[#0F172A]">PlotiSmarta</span>
            <span className="text-[10px] ml-2 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-white/70 border border-[#CBD5E1] text-[#0045A5]">
              Kenya OS
            </span>
          </div>
        </div>

        <div className="text-xs text-[#64748B] font-medium hidden sm:block">
          Nairobi • Kilimani • Westlands • Kileleshwa
        </div>
      </header>

      <main className="relative z-10 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6">
        {content}
      </main>

      <footer className="py-6 text-center text-xs text-[#64748B]">
        &copy; 2024 PlotiSmarta Management Systems. All rights reserved.
      </footer>
    </div>
  );
};
