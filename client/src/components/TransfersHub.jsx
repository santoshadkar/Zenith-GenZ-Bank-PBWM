import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Send, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  UserCheck,
  AlertCircle
} from 'lucide-react';

export default function TransfersHub({ accounts, onRefresh, user }) {
  const [fromAccount, setFromAccount] = useState(accounts[0]?.id || '');
  const [toRecipient, setToRecipient] = useState('@alex_wealth');
  const [amount, setAmount] = useState('65000');
  const [description, setDescription] = useState('Monthly Private Wealth Transfer (INR)');
  const [mfaCode, setMfaCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const numAmount = parseFloat(amount || 0);
  const requiresMfa = numAmount >= 50000; // Step-up MFA for transfers >= ₹50,000

  const handleExecuteTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/banking/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('aura_token')}`
        },
        body: JSON.stringify({
          fromAccountId: fromAccount,
          toRecipient,
          amount: numAmount,
          description,
          mfaCode
        })
      });

      const data = await res.json();

      if (res.status === 422 && data.error === 'MFA_REQUIRED') {
        setMfaRequired(true);
        setErrorMsg('Step-Up MFA Required for high-value transfer (₹50,000+). Click "Generate MFA Passcode" below.');
      } else if (!res.ok) {
        setErrorMsg(data.error || 'Transfer failed');
      } else {
        setSuccessMsg(`Transfer of ₹${numAmount.toLocaleString('en-IN')} to ${toRecipient} completed!`);
        setMfaRequired(false);
        setMfaCode('');
        onRefresh();
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMfa = async () => {
    try {
      const res = await fetch('/api/auth/mfa/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('aura_token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setMfaCode(data.otpCode);
        setSuccessMsg(`Generated Simulated MFA Passcode: [ ${data.otpCode} ]`);
      }
    } catch (err) {
      setErrorMsg('Failed to generate MFA code');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <ArrowLeftRight className="w-4 h-4" />
              <span>Private Banking Money Movement (INR)</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold text-white tracking-tight">
              Instant Wire, NEFT/RTGS & UPI
            </h1>
            <p className="mt-1 text-xs text-slate-300 max-w-xl">
              Zero-fee private wealth transfers in Indian Rupees with automated step-up Multi-Factor Authentication for amounts exceeding ₹50,000.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transfer Form (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center">
            <Send className="w-4 h-4 mr-2 text-emerald-400" /> New Money Movement (INR)
          </h2>

          {errorMsg && (
            <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleExecuteTransfer} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Source Private Account</label>
                <select
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  className="w-full bg-slate-900 border border-aura-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_type} (₹{acc.balance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">UPI ID / Recipient Account</label>
                <input
                  type="text"
                  required
                  placeholder="@handle or ZA-XXXX-XXXX"
                  value={toRecipient}
                  onChange={(e) => setToRecipient(e.target.value)}
                  className="w-full bg-slate-900 border border-aura-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Transfer Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-aura-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Transfer Note / Tag</label>
                <input
                  type="text"
                  placeholder="Monthly savings or wire"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-aura-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* MFA Security Challenge Box */}
            {requiresMfa && (
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                  <span className="flex items-center">
                    <Lock className="w-4 h-4 mr-1.5 text-purple-400" /> Step-Up MFA Security Challenge (₹50,000+ Threshold)
                  </span>
                  <span className="text-[10px] text-purple-400">Authenticator Required</span>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Enter 6-digit MFA passcode"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    className="w-full bg-slate-900 border border-aura-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateMfa}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 transition-all"
                  >
                    Generate Code
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all"
            >
              {loading ? 'Processing Transfer...' : 'Authorize Private Money Transfer'}
            </button>
          </form>
        </div>

        {/* Security & Limits Info (1 col) */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" /> Transfer Compliance & Limits
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Instant UPI & NEFT:</strong> Funds clear instantly across all internal Zenith accounts.</span>
              </div>
              <div className="flex items-start space-x-2">
                <Lock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>Step-Up MFA:</strong> Automatically triggered for transfers &ge; ₹50,000.00.</span>
              </div>
              <div className="flex items-start space-x-2">
                <UserCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>GenZ Account Limits:</strong> Up to ₹1,00,00,000 daily wire limit for Tier 3 accounts.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
