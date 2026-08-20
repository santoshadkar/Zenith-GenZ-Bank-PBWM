import React, { useState } from 'react';
import { 
  PiggyBank, 
  Plus, 
  Sparkles, 
  Target, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Info
} from 'lucide-react';

export default function GenZSavings({ plans, accounts, onRefresh, user }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Form states in INR
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [category, setCategory] = useState('Real Estate');
  const [monthlyContrib, setMonthlyContrib] = useState('5000');
  
  const [depositAmount, setDepositAmount] = useState('');
  const [fromAccount, setFromAccount] = useState(accounts[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/savings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('aura_token')}`
        },
        body: JSON.stringify({
          name,
          targetAmount,
          category,
          monthlyContribution: monthlyContrib,
          targetDate: '2028-12-31'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('GenZ Individual Savings Plan Created!');
        setShowCreateModal(false);
        setName('');
        setTargetAmount('');
        onRefresh();
      } else {
        setMessage(data.error || 'Failed to create plan');
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/savings/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('aura_token')}`
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          amount: parseFloat(depositAmount),
          fromAccountId: fromAccount
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Successfully stashed ₹${parseFloat(depositAmount).toLocaleString('en-IN')} into ${selectedPlan.name}!`);
        setShowDepositModal(false);
        setDepositAmount('');
        onRefresh();
      } else {
        setMessage(data.error || 'Deposit failed');
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRoundup = async (planId, currentVal) => {
    try {
      await fetch('/api/savings/toggle-roundup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('aura_token')}`
        },
        body: JSON.stringify({ planId, enabled: !currentVal })
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const totalSaved = plans.reduce((acc, p) => acc + p.current_amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <PiggyBank className="w-4 h-4" />
              <span>GenZ Individual Savings Plan (ISP)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold">
                6.75% - 7.50% APY Yield
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold text-white tracking-tight">
              Automated Micro-Investing & Target Vaults
            </h1>
            <p className="mt-1 text-xs text-slate-300 max-w-xl">
              Lock in high-yield compound interest, set up auto-roundup stashing from daily UPI purchases, and track long-term GenZ wealth milestones in INR.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New GenZ Vault</span>
          </button>
        </div>

        {/* Global ISP Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-aura-border">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Vault Balance</span>
            <div className="text-2xl font-extrabold text-white glow-text-cyan mt-1">
              ₹{totalSaved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Average APY Yield</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1 flex items-center">
              <Sparkles className="w-4 h-4 mr-1" /> 6.85% APY
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Smart Round-Ups Status</span>
            <div className="text-2xl font-extrabold text-cyan-400 mt-1 flex items-center">
              <Zap className="w-4 h-4 mr-1 fill-cyan-400" /> Active (UPI Roundups)
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Vault Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const progress = Math.min(100, (plan.current_amount / plan.target_amount) * 100);
          return (
            <div key={plan.id} className="glass-panel p-6 rounded-3xl flex flex-col justify-between hover:border-cyan-500/40 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                    {plan.category}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" /> {plan.apy}% APY
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {plan.name}
                </h3>

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Current Balance</span>
                    <div className="text-xl font-extrabold text-white">
                      ₹{plan.current_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Target Goal</span>
                    <div className="text-sm font-semibold text-slate-300">
                      ₹{plan.target_amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1.5">
                    <span>Target Progress</span>
                    <span className="text-cyan-400">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-aura-border">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-aura-border space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center">
                    <Zap className="w-3.5 h-3.5 mr-1 text-cyan-400" /> UPI Auto Purchase Round-up:
                  </span>
                  <button 
                    onClick={() => handleToggleRoundup(plan.id, Boolean(plan.auto_roundup))}
                    className="flex items-center text-xs font-bold transition-all"
                  >
                    {plan.auto_roundup ? (
                      <span className="text-emerald-400 flex items-center">
                        <ToggleRight className="w-6 h-6 mr-1" /> ON
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center">
                        <ToggleLeft className="w-6 h-6 mr-1" /> OFF
                      </span>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => {
                    setSelectedPlan(plan);
                    setShowDepositModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-500/30 transition-all flex items-center justify-center space-x-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Stash Funds into Vault</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-cyan-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-cyan-400" /> Create GenZ Savings Vault
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Vault Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., First House Down-Payment, Tech Fund"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-aura-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Target Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="500000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-aura-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-aura-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Real Estate">Real Estate</option>
                    <option value="Innovation">Innovation & AI</option>
                    <option value="Travel">Travel & Lifestyle</option>
                    <option value="Security">Emergency Vault</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Monthly Auto-Stash (₹)</label>
                <input
                  type="number"
                  value={monthlyContrib}
                  onChange={(e) => setMonthlyContrib(e.target.value)}
                  className="w-full bg-slate-900 border border-aura-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all mt-4"
              >
                {loading ? 'Creating Vault...' : 'Launch Individual Savings Plan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-emerald-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <PiggyBank className="w-5 h-5 mr-2 text-emerald-400" /> Deposit into {selectedPlan.name}
              </h3>
              <button onClick={() => setShowDepositModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Select Source Cash Account</label>
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
                <label className="block text-xs font-bold text-slate-300 mb-1">Deposit Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="10000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-aura-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all mt-4"
              >
                {loading ? 'Stashing Funds...' : 'Confirm Deposit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
