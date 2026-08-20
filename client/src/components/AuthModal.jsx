import React, { useState } from 'react';
import { 
  Wallet, 
  Lock, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  Calendar, 
  Key,
  User,
  CreditCard
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  
  // Login State
  const [accountOrEmail, setAccountOrEmail] = useState('ZA-8849-2091');
  const [password, setPassword] = useState('Zenith2026!');
  const [otpCode, setOtpCode] = useState('');

  // Register 4-Step Wizard State
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('2003-04-14');
  const [initialDeposit, setInitialDeposit] = useState('100000'); // ₹1,00,000
  const [fundingSource, setFundingSource] = useState('HDFC Private Banking / UPI');
  
  const [createdAccountNum, setCreatedAccountNum] = useState('');
  const [initialOtp, setInitialOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  if (!isOpen) return null;

  const calculateAge = (dobStr) => {
    if (!dobStr) return 0;
    const birth = new Date(dobStr);
    const diffMs = Date.now() - birth.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const currentAge = calculateAge(dob);
  const isMinor = currentAge < 18;

  const handleRequestOtp = async () => {
    setLoading(true);
    setError('');
    setInfoMsg('');
    try {
      const res = await fetch('/api/auth/request-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumberOrEmail: accountOrEmail, password })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpCode(data.otpCode);
        setInfoMsg(`Simulated 2FA OTP Passcode generated: [ ${data.otpCode} ]`);
      } else {
        setError(data.error || 'Credentials invalid for OTP generation');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumberOrEmail: accountOrEmail, password, otpCode })
      });
      const data = await res.json();

      if (res.ok && data.token) {
        onLoginSuccess(data.token, data.user);
        onClose();
      } else {
        setError(data.error || data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStep1Next = (e) => {
    e.preventDefault();
    if (!name || !email || !dob) {
      setError('Please fill in all personal details and DOB');
      return;
    }
    setError('');
    const rand1 = Math.floor(1000 + Math.random() * 9000);
    const rand2 = Math.floor(1000 + Math.random() * 9000);
    setCreatedAccountNum(`ZA-${rand1}-${rand2}`);
    setStep(2);
  };

  const handleRegisterSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          dob,
          initialDeposit: parseFloat(initialDeposit),
          fundingSource
        })
      });
      const data = await res.json();

      if (res.ok && data.token) {
        setCreatedAccountNum(data.accountNumber);
        setInitialOtp(data.otpCode);
        setStep(4);
        onLoginSuccess(data.token, data.user);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdult = () => {
    setMode('login');
    setAccountOrEmail('ZA-8849-2091');
    setPassword('Zenith2026!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-emerald-500/30 shadow-2xl relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
        >
          ✕
        </button>

        {/* Brand Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-[1px]">
            <div className="w-full h-full bg-[#090D16] rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">ZENITH AURA</h2>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">GenZ Private Wealth Gateway (INR)</p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-aura-border mb-6">
          <button
            onClick={() => { setMode('login'); setError(''); setInfoMsg(''); }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'login' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pre-Login MFA Gate
          </button>
          <button
            onClick={() => { setMode('register'); setStep(1); setError(''); setInfoMsg(''); }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'register' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            GenZ Onboarding Wizard
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {infoMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center space-x-2">
            <Lock className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* PRE-LOGIN MFA AUTHENTICATION */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center">
                <CreditCard className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Account Number (or Email)
              </label>
              <input
                type="text"
                required
                placeholder="ZA-8849-2091"
                value={accountOrEmail}
                onChange={(e) => setAccountOrEmail(e.target.value)}
                className="w-full bg-slate-900 border border-aura-border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center">
                <Lock className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-aura-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                <span className="flex items-center">
                  <Key className="w-3.5 h-3.5 mr-1 text-purple-400" /> Step-Up 2FA OTP Required
                </span>
                <span className="text-[10px] text-purple-400">Pre-Login Shield</span>
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  required
                  placeholder="Enter 6-digit OTP code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-slate-900 border border-aura-border rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 transition-all shadow-md"
                >
                  Get 2FA OTP Code
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all mt-2"
            >
              {loading ? 'Verifying Credentials & MFA...' : 'Authorize & Open Wealth Portfolio'}
            </button>

            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Demo Preset:</span>
              <button
                type="button"
                onClick={fillDemoAdult}
                className="text-emerald-400 hover:underline font-semibold"
              >
                Auto-fill Account ZA-8849-2091
              </button>
            </div>
          </form>
        )}

        {/* 4-STEP GENZ ONBOARDING WIZARD */}
        {mode === 'register' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === s 
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
                      : step > s 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-500'
                  }`}>
                    {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                  </div>
                  {s < 4 && <div className={`w-8 sm:w-12 h-0.5 mx-1 ${step > s ? 'bg-emerald-500' : 'bg-slate-800'}`} />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <form onSubmit={handleStep1Next} className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-2">Step 1: Personal Details & DOB Verification</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Ananya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-aura-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="ananya.sharma@genzwealth.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-aura-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Account Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-aura-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-300">Date of Birth (DOB)</label>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isMinor ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      Calculated Age: {currentAge} ({isMinor ? 'Minor Protection' : 'Adult GenZ Verified'})
                    </span>
                  </div>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-slate-900 border border-aura-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Continue to Account Number Generation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-2">Step 2: Private Banking Account Assignment</h3>

                <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/40 text-center space-y-2">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">
                    Issued Zenith Account Number
                  </span>
                  <div className="text-2xl font-extrabold text-white font-mono glow-text-cyan">
                    {createdAccountNum}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Use this Account Number and your password along with 2FA OTP for future logins.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="w-2/3 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Proceed to Initial Funding (₹)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-2">Step 3: Initial Deposit Funding Amount (₹)</h3>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Select Initial Balance Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={initialDeposit}
                    onChange={(e) => setInitialDeposit(e.target.value)}
                    className="w-full bg-slate-900 border border-aura-border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex space-x-2 mt-2">
                    {['25000', '50000', '100000', '500000'].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setInitialDeposit(val)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                          initialDeposit === val ? 'bg-emerald-500 text-slate-950 border-emerald-500' : 'bg-slate-900 text-slate-400 border-aura-border'
                        }`}
                      >
                        ₹{parseInt(val).toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Source Wire / UPI / Bank Method</label>
                  <select
                    value={fundingSource}
                    onChange={(e) => setFundingSource(e.target.value)}
                    className="w-full bg-slate-900 border border-aura-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="HDFC Private Banking / UPI">HDFC Private Banking / UPI</option>
                    <option value="ICICI Wealth NetBanking">ICICI Wealth NetBanking</option>
                    <option value="Axis Bank Wire Transfer">Axis Bank Wire Transfer</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-aura-border text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Cash Account Funded:</span>
                    <span className="font-bold text-emerald-400">₹{parseFloat(initialDeposit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GenZ ISP Vault Auto-Seed:</span>
                    <span className="font-bold text-cyan-400">₹{(parseFloat(initialDeposit || 0) * 0.2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep(2)}
                    className="w-1/3 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleRegisterSubmit}
                    disabled={loading}
                    className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>{loading ? 'Creating & Funding Account...' : 'Complete Registration & Fund ₹'}</span>
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-white">Account Created & Funded Successfully!</h3>
                
                <div className="p-4 rounded-2xl bg-slate-900 border border-aura-border text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Account Number:</span>
                    <span className="font-mono font-bold text-white">{createdAccountNum}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Initial Balance:</span>
                    <span className="font-bold text-emerald-400">₹{parseFloat(initialDeposit).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">2FA OTP Code:</span>
                    <span className="font-mono font-bold text-purple-400">{initialOtp}</span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
                >
                  Open Custom GenZ Portfolio
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
