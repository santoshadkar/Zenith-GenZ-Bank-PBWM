import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  UserCheck, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw,
  CheckCircle2,
  Calendar,
  ShieldAlert
} from 'lucide-react';

export default function SecurityKyc({ user, onRefresh }) {
  const [testDob, setTestDob] = useState(user?.dob || '2003-04-14');
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [mfaStatus, setMfaStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateUiAge = (dobString) => {
    if (!dobString) return 0;
    const dob = new Date(dobString);
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const currentAge = calculateUiAge(testDob);
  const isMinor = currentAge < 18;

  const handleGenerateCode = async () => {
    setLoading(true);
    setMfaStatus('');
    try {
      const res = await fetch('/api/auth/mfa/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('aura_token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedCode(data.otpCode);
        setMfaStatus('6-Digit Step-Up MFA Passcode generated!');
      }
    } catch (err) {
      setMfaStatus('Failed to generate MFA code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('aura_token')}`
        },
        body: JSON.stringify({ code: inputCode })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setMfaStatus('✅ Multi-Factor Authentication Code Verified Successfully!');
        setInputCode('');
      } else {
        setMfaStatus(`❌ ${data.error || 'Invalid passcode'}`);
      }
    } catch (err) {
      setMfaStatus('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
              <Lock className="w-4 h-4" />
              <span>Identity, KYC & Multi-Factor Security</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold text-white tracking-tight">
              Regulatory Compliance & MFA Engine
            </h1>
            <p className="mt-1 text-xs text-slate-300 max-w-xl">
              Automatic DOB-based age classification, minor protection controls, and TOTP Multi-Factor Authentication challenge simulators.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Check & KYC Verification Module */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-cyan-400" /> DOB Age Verification Logic
            </h2>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
              isMinor 
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            }`}>
              {isMinor ? 'Minor Protection Status' : 'Tier 3 Wealth Verified'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-aura-border space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Account Holder:</span>
              <span className="font-bold text-white">{user?.name || 'Alex Rivers'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Date of Birth (DOB):</span>
              <input
                type="date"
                value={testDob}
                onChange={(e) => setTestDob(e.target.value)}
                className="bg-slate-800 border border-aura-border rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
              />
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-aura-border">
              <span className="text-slate-400">Calculated Age:</span>
              <span className="font-extrabold text-base text-white">{currentAge} Years Old</span>
            </div>
          </div>

          {/* Status Breakdown Box */}
          <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
            isMinor 
              ? 'bg-amber-950/30 border-amber-500/30 text-amber-200' 
              : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
          }`}>
            <div className="font-bold flex items-center">
              {isMinor ? <ShieldAlert className="w-4 h-4 mr-1.5 text-amber-400" /> : <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-400" />}
              {isMinor ? 'Minor Investor Guardrail Activated (< 18 Yrs)' : 'Full Private Banking Clearance (18+ Yrs)'}
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] opacity-90">
              {isMinor ? (
                <>
                  <li>Unbacked Crypto trading disabled to protect minor investors</li>
                  <li>High-value wire transfers (&gt; ₹50,000) trigger MFA & Co-sign alerts</li>
                  <li>GenZ Individual Savings Plans (ISP) high-yield APY enabled</li>
                </>
              ) : (
                <>
                  <li>Full unrestricted access to stocks, ETFs, crypto, and private equity</li>
                  <li>Unlimited wire limits with step-up MFA challenge support</li>
                  <li>Direct GenZ ISP wealth vaults & auto-roundup execution</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Multi-Factor Authentication (MFA) Simulator */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center">
              <Key className="w-4 h-4 mr-2 text-purple-400" /> 2FA Authenticator Simulator
            </h2>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
              TOTP Step-Up Security
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Zenith Aura enforces Multi-Factor Authentication for sensitive actions. Use this live simulator to generate and test 6-digit TOTP passcodes.
          </p>

          <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-center space-y-3">
            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest block">
              Simulated Authenticator App Display
            </span>

            <div className="text-3xl font-extrabold tracking-widest font-mono text-white glow-text-violet">
              {generatedCode ? `${generatedCode.substring(0,3)} ${generatedCode.substring(3,6)}` : '• • •  • • •'}
            </div>

            <button
              onClick={handleGenerateCode}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              {loading ? 'Generating...' : 'Generate New 6-Digit Passcode'}
            </button>
          </div>

          {/* Test Verification Input */}
          <form onSubmit={handleVerifyCode} className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-300">Test MFA Passcode Verification</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full bg-slate-900 border border-aura-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={loading || !inputCode}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shrink-0 hover:bg-emerald-400 transition-all disabled:opacity-50"
              >
                Verify Code
              </button>
            </div>
          </form>

          {mfaStatus && (
            <div className="p-3 rounded-xl bg-slate-900 border border-aura-border text-xs font-bold text-slate-200">
              {mfaStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
