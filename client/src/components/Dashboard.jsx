import React from 'react';
import { 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  PiggyBank, 
  ShieldCheck, 
  Sparkles, 
  PlusCircle, 
  Send, 
  ChevronRight,
  Clock,
  Lock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Dashboard({ summary, accounts, transactions, onNavigate, user }) {
  // Chart historical data in INR
  const historicalData = [
    { month: 'Jan', netWorth: 1800000, savings: 200000 },
    { month: 'Feb', netWorth: 1950000, savings: 240000 },
    { month: 'Mar', netWorth: 2050000, savings: 280000 },
    { month: 'Apr', netWorth: 2180000, savings: 310000 },
    { month: 'May', netWorth: 2300000, savings: 335000 },
    { month: 'Jun', netWorth: summary?.netWorth || 2416000, savings: summary?.savingsTotal || 348000 },
  ];

  const allocationData = [
    { name: 'Private HY-Cash', value: summary?.cashTotal || 245000, color: '#10B981' },
    { name: 'GenZ Savings Vaults', value: summary?.savingsTotal || 348000, color: '#06B6D4' },
    { name: 'Stocks & ETFs', value: 1200000, color: '#8B5CF6' },
    { name: 'Crypto & Assets', value: 623000, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Net Worth & Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Total Net Worth (INR)</span>
              </div>
              <div className="mt-2 flex items-baseline space-x-3">
                <span className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white glow-text-emerald">
                  ₹{summary?.netWorth?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '24,16,000.50'}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +14.2% YTD
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Combined balance across Private Banking Cash, GenZ ISP Vaults & Trading Assets in Indian Rupees (INR)
              </p>
            </div>

            {/* Quick Action Pills */}
            <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
              <button
                onClick={() => onNavigate('transfers')}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transfer Money</span>
              </button>

              <button
                onClick={() => onNavigate('savings')}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-aura-border transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Stash in Savings</span>
              </button>
            </div>
          </div>

          {/* Recharts Area Graph */}
          <div className="mt-6 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/100000}L`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} 
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, '']}
                />
                <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorNetWorth)" />
                <Area type="monotone" dataKey="savings" name="GenZ Vaults" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Breakdown & Status */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200">Asset Allocation</h3>
              <span className="text-xs text-emerald-400 font-semibold flex items-center">
                <Sparkles className="w-3 h-3 mr-1" /> Balanced
              </span>
            </div>

            {/* Donut Chart */}
            <div className="h-44 w-full relative my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val) => `₹${val.toLocaleString('en-IN')}`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
                <span className="text-xs font-extrabold text-white">₹24.16L</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 mt-2">
              {allocationData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-white">₹{item.value.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-aura-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Account Security Status:</span>
              <span className="font-bold text-emerald-400 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> MFA Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Balances Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center">
            <Wallet className="w-4 h-4 mr-2 text-emerald-400" /> Private Accounts Overview (INR)
          </h2>
          <button 
            onClick={() => onNavigate('transfers')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center"
          >
            Manage Accounts <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div key={acc.id} className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{acc.account_type}</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800 text-slate-300 border border-aura-border">
                  {acc.account_number}
                </span>
              </div>

              <div className="text-2xl font-extrabold text-white">
                ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-aura-border/60 text-slate-400">
                <span className="flex items-center text-emerald-400 font-medium">
                  <Sparkles className="w-3 h-3 mr-1" /> 6.75% APY Yield
                </span>
                <button 
                  onClick={() => onNavigate('transfers')}
                  className="hover:text-white font-semibold flex items-center transition-all"
                >
                  Deposit <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Ledger Transactions */}
      <div className="glass-panel p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center">
              <Clock className="w-4 h-4 mr-2 text-cyan-400" /> Private Wealth Ledger
            </h3>
            <p className="text-xs text-slate-400">Real-time audit trail of all transactions and MFA verifications in Indian Rupees</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Top 5 Recent</span>
        </div>

        <div className="space-y-3">
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/50 border border-aura-border/40 hover:bg-slate-900/80 transition-all">
              <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                  tx.type === 'Deposit' || tx.type === 'Interest' || tx.type === 'Roundup'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                }`}>
                  {tx.type === 'Deposit' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-200">{tx.description}</div>
                  <div className="text-[10px] text-slate-400 flex items-center space-x-2 mt-0.5">
                    <span>{tx.category}</span>
                    <span>•</span>
                    <span>{new Date(tx.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-xs font-extrabold ${
                  tx.type === 'Deposit' || tx.type === 'Interest' || tx.type === 'Roundup' ? 'text-emerald-400' : 'text-slate-100'
                }`}>
                  {tx.type === 'Deposit' || tx.type === 'Interest' || tx.type === 'Roundup' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                {tx.step_up_mfa_verified === 1 && (
                  <span className="inline-flex items-center text-[9px] font-bold text-purple-400 mt-0.5">
                    <Lock className="w-2.5 h-2.5 mr-0.5" /> Step-Up Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
