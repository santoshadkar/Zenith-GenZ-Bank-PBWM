import React from 'react';
import { 
  ShieldCheck, 
  Wallet, 
  TrendingUp, 
  ArrowLeftRight, 
  Lock, 
  PiggyBank, 
  UserCheck, 
  AlertTriangle,
  LogOut,
  Sparkles,
  ChevronRight,
  CreditCard
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, onLogout, onOpenAuth }) {
  return (
    <header className="sticky top-0 z-40 border-b border-aura-border bg-[#090D16]/90 backdrop-blur-xl">
      {/* Live Market & Security Ticker Bar */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-purple-950/30 to-cyan-950/40 border-b border-emerald-500/10 px-4 py-1.5 text-xs flex items-center justify-between text-slate-300">
        <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar">
          <span className="flex items-center text-emerald-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 mr-1 animate-pulse" /> Zenith GenZ APY: <strong className="ml-1 text-white">6.75%</strong>
          </span>
          <span className="text-slate-400">|</span>
          <span className="flex items-center">
            NVDA <span className="ml-1 text-emerald-400 font-semibold">₹11,200 (+3.45%)</span>
          </span>
          <span className="flex items-center">
            BTC <span className="ml-1 text-emerald-400 font-semibold">₹53,50,000 (+4.80%)</span>
          </span>
          <span className="flex items-center">
            ETH <span className="ml-1 text-emerald-400 font-semibold">₹2,87,500 (+2.15%)</span>
          </span>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3 mr-1" /> 256-bit Encrypted
          </span>
          {user && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              user.isMinor 
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
            }`}>
              {user.isMinor ? <AlertTriangle className="w-3 h-3 mr-1" /> : <UserCheck className="w-3 h-3 mr-1" />}
              {user.age} Yrs ({user.isMinor ? 'Minor Protection' : 'Verified Adult'})
            </span>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-purple-600 p-[1px] shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-[#090D16] rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">ZENITH</span>
                <span className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">AURA</span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">GenZ Private Banking & Wealth</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-2xl border border-aura-border">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('savings')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'savings'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <PiggyBank className="w-4 h-4" />
              <span>GenZ Savings Plan</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 font-bold">ISP</span>
            </button>

            <button
              onClick={() => setActiveTab('trading')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'trading'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Wealth & Trading</span>
            </button>

            <button
              onClick={() => setActiveTab('transfers')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'transfers'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Transfers</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'security'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Lock className="w-4 h-4 text-purple-400" />
              <span>Security & MFA</span>
            </button>
          </nav>

          {/* User Account Widget */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-100 flex items-center justify-end">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono flex items-center justify-end">
                    <CreditCard className="w-3 h-3 mr-1" /> {user.accountNumber || 'ZA-8849-2091'}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Switch / Logout"
                  className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-aura-border transition-all flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all"
              >
                <span>Onboard / Sign In</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
