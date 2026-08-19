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
  UserPlus
} from 'lucide-react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { useProperty } from '../context/PropertyContext';

export const LoginPage: React.FC = () => {
  const { login, register, authError, clearAuthError, properties } = useProperty();
  
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
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
      setLocalError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim() && !regPhone.trim()) {
      setLocalError('Please provide an email address or Kenyan phone number.');
      return;
    }

    const selectedProp = properties.find(p => p.id === regPropertyId) || properties[0];

    setIsLoading(true);
    try {
      await register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword || 'haven2026',
        role: regRole,
        propertyId: regRole === 'tenant' ? selectedProp?.id : undefined,
        propertyName: regRole === 'tenant' ? selectedProp?.name : undefined,
        unitNumber: regRole === 'tenant' ? regUnitNumber : undefined,
        rentAmount: regRole === 'tenant' ? 75000 : undefined
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
                Secure Kenyan Property Portal
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif text-[#2C362C] tracking-tight">
                {authMode === 'signin' ? 'Sign In to Your Account' : 'Create a Haven Account'}
              </h1>
              <p className="text-xs sm:text-sm text-[#8C8880]">
                {authMode === 'signin' 
                  ? 'Enter your email address or Kenyan phone number (+254 / 07...) to access your dedicated portal.'
                  : 'Register as a Resident or Landlord with Nairobi property linking.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex justify-center">
              <div className="bg-[#F5F2EC] p-1 rounded-2xl inline-flex space-x-1">
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
                      ? 'bg-white text-[#2C362C] shadow-xs'
                      : 'text-[#8C8880] hover:text-[#2C362C]'
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
                      ? 'bg-white text-[#2C362C] shadow-xs'
                      : 'text-[#8C8880] hover:text-[#2C362C]'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Error Message Display */}
            {(localError || authError) && (
              <div className="p-4 rounded-2xl bg-[#FBF1EE] border border-[#D17A5E]/20 text-[#D17A5E] text-xs flex items-center space-x-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="font-medium">{localError || authError}</p>
              </div>
            )}

            {/* Form Section */}
            {authMode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4 max-w-md mx-auto">
                
                {/* Identifier Input (Email or Phone) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2C362C] mb-1.5">
                    Email Address or Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8880]">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="auth-identifier-input"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. juma.ochieng@gmail.com or 0712345678"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-[#EDE8DF] rounded-2xl text-sm text-[#2C362C] placeholder-[#8C8880]/60 focus:bg-white focus:border-[#5A6D5A] focus:outline-hidden transition"
                    />
                  </div>
                  <p className="text-[11px] text-[#8C8880] mt-1">
                    Accepts Kenyan format: <code className="text-[#4A5D4A]">0712345678</code> or <code className="text-[#4A5D4A]">+254 712 345 678</code> or email.
                  </p>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2C362C]">
                      Password / Security PIN
                    </label>
                    <span className="text-[11px] text-[#8C8880]">
                      Default: <span className="font-semibold text-[#4A5D4A]">haven2026</span>
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8880]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="auth-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      className="w-full pl-10 pr-10 py-3 bg-[#FAF8F5] border border-[#EDE8DF] rounded-2xl text-sm text-[#2C362C] placeholder-[#8C8880]/60 focus:bg-white focus:border-[#5A6D5A] focus:outline-hidden transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C8880] hover:text-[#2C362C]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Role Switcher Hint (Landlord vs Resident) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2C362C] mb-1.5">
                    Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      id="role-select-tenant-btn"
                      onClick={() => setRoleHint('tenant')}
                      className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                        roleHint === 'tenant'
                          ? 'border-[#5A6D5A] bg-[#F2F6F2] text-[#4A5D4A]'
                          : 'border-[#EDE8DF] text-[#8C8880] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Resident Portal</span>
                    </button>

                    <button
                      type="button"
                      id="role-select-landlord-btn"
                      onClick={() => setRoleHint('landlord')}
                      className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                        roleHint === 'landlord'
                          ? 'border-[#2C362C] bg-[#2C362C] text-white'
                          : 'border-[#EDE8DF] text-[#8C8880] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Landlord Admin</span>
                    </button>
                  </div>
                </div>

                {/* Sign In Submit Button */}
                <button
                  type="submit"
                  id="auth-submit-btn"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#5A6D5A] hover:bg-[#4a5a4a] text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-sm transition active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating with Haven Go API...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In with Credentials</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Sign Up Form */
              <form onSubmit={handleSignUp} className="space-y-4 max-w-md mx-auto">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2C362C] mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="signup-name-input"
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Kevin Mwenda"
                    required
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE8DF] rounded-2xl text-sm text-[#2C362C] placeholder-[#8C8880]/60 focus:bg-white focus:border-[#5A6D5A] focus:outline-hidden transition"
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2C362C] mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="signup-email-input"
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="mwenda@gmail.com"
                      className="w-full px-3.5 py-3 bg-[#FAF8F5] border border-[#EDE8DF] rounded-2xl text-sm text-[#2C362C] placeholder-[#8C8880]/60 focus:bg-white focus:border-[#5A6D5A] focus:outline-hidden transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2C362C] mb-1.5">
                      Kenyan Phone (+254)
                    </label>
                    <input
                      id="signup-phone-input"
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+254 712 000 000"
                      className="w-full px-3.5 py-3 bg-[#FAF8F5] border border-[#EDE8DF] rounded-2xl text-sm text-[#2C362C] placeholder-[#8C8880]/60 focus:bg-white focus:border-[#5A6D5A] focus:outline-hidden transition"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2C362C] mb-1.5">
                    Create Password
                  </label>
                  <input
                    id="signup-password-input"
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE8DF] rounded-2xl text-sm text-[#2C362C] placeholder-[#8C8880]/60 focus:bg-white focus:border-[#5A6D5A] focus:outline-hidden transition"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2C362C] mb-1.5">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('tenant')}
                      className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                        regRole === 'tenant'
                          ? 'border-[#5A6D5A] bg-[#F2F6F2] text-[#4A5D4A]'
                          : 'border-[#EDE8DF] text-[#8C8880] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Resident</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('landlord')}
                      className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                        regRole === 'landlord'
                          ? 'border-[#2C362C] bg-[#2C362C] text-white'
                          : 'border-[#EDE8DF] text-[#8C8880] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Landlord</span>
                    </button>
                  </div>
                </div>

                {/* Tenant Property Assignment */}
                {regRole === 'tenant' && (
                  <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EDE8DF] space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#5A6D5A]">
                      Nairobi Residence Details
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-[#8C8880] mb-1">Estate / Property</label>
                        <select
                          value={regPropertyId}
                          onChange={(e) => setRegPropertyId(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#EDE8DF] rounded-xl text-xs text-[#2C362C]"
                        >
                          {properties.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#8C8880] mb-1">Unit Number</label>
                        <input
                          type="text"
                          value={regUnitNumber}
                          onChange={(e) => setRegUnitNumber(e.target.value)}
                          placeholder="e.g. 4A"
                          className="w-full px-3 py-2 bg-white border border-[#EDE8DF] rounded-xl text-xs text-[#2C362C]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Sign Up */}
                <button
                  type="submit"
                  id="signup-submit-btn"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#2C362C] hover:bg-[#1a211a] text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-sm transition active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account in Go Database...</span>
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

            {/* Quick Demo Pre-fill Cards */}
            <div className="pt-6 border-t border-[#F2EFEA] space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-[#8C8880]">
                <span>Registered Test Accounts (1-Click Fill & Instant Sign In)</span>
                <span className="text-[11px] text-[#4A5D4A]">Safaricom & Gmail Connected</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* Landlord Card */}
                {landlordUsers.map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => fillQuickPreset(user)}
                    className="p-3.5 rounded-2xl border border-[#EDE8DF] hover:border-[#2C362C] bg-[#FAF8F5] hover:bg-white text-left transition group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <div className="overflow-hidden">
                        <div className="flex items-center space-x-1.5">
                          <p className="text-xs font-bold text-[#2C362C] truncate">{user.name}</p>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase bg-[#2C362C] text-white">
                            Landlord
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8C8880] truncate">{user.email}</p>
                        <p className="text-[10px] text-[#5A6D5A] font-mono">{user.phone}</p>
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
                    className="p-3.5 rounded-2xl border border-[#EDE8DF] hover:border-[#5A6D5A] bg-[#FAF8F5] hover:bg-white text-left transition group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <div className="overflow-hidden">
                        <div className="flex items-center space-x-1.5">
                          <p className="text-xs font-bold text-[#2C362C] truncate">{user.name}</p>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase bg-[#F2F6F2] text-[#4A5D4A]">
                            Apt {user.unitNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8C8880] truncate">{user.email}</p>
                        <p className="text-[10px] text-[#5A6D5A] font-mono">{user.phone}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Footer Info Strip */}
          <div className="bg-[#FAF8F5] border-t border-[#EDE8DF] px-8 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C8880] gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#5A6D5A]" />
              <span>Full session persistence enabled with Go file-backed JSON database</span>
            </div>
            <div className="text-[11px]">
              Currency: <strong>KSh (Kenyan Shillings)</strong> • M-Pesa Integrated
            </div>
          </div>

        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="py-6 text-center text-xs text-[#8C8880]">
        &copy; {new Date().getFullYear()} Haven Property Management OS — Nairobi, Kenya.
      </footer>

    </div>
  );
};
