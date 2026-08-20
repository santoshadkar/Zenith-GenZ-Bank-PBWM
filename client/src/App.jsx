import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import GenZSavings from './components/GenZSavings';
import TradingHub from './components/TradingHub';
import TransfersHub from './components/TransfersHub';
import SecurityKyc from './components/SecurityKyc';
import AuthModal from './components/AuthModal';
import { 
  Wallet, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  PiggyBank, 
  TrendingUp, 
  UserPlus, 
  Key,
  ShieldAlert,
  Coins
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(true); // Open Onboarding/Login modal by default
  const [token, setToken] = useState(''); // Default logged out state

  // Banking State
  const [summary, setSummary] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [savingsPlans, setSavingsPlans] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Verify existing token if present
  useEffect(() => {
    const savedToken = localStorage.getItem('aura_token');
    if (savedToken) {
      fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.id) {
            setToken(savedToken);
            setUser(data);
            setIsAuthOpen(false);
          } else {
            localStorage.removeItem('aura_token');
          }
        })
        .catch(() => localStorage.removeItem('aura_token'));
    }
  }, []);

  // Fetch Banking & Wealth Data
  const loadData = () => {
    if (!token) return;

    const headers = { 'Authorization': `Bearer ${token}` };

    fetch('/api/banking/accounts', { headers })
      .then(res => res.json())
      .then(data => {
        setAccounts(data.accounts || []);
        setSummary(data.summary || null);
      })
      .catch(console.error);

    fetch('/api/savings/plans', { headers })
      .then(res => res.json())
      .then(data => setSavingsPlans(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch('/api/trading/portfolio', { headers })
      .then(res => res.json())
      .then(data => setPortfolio(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch('/api/banking/transactions', { headers })
      .then(res => res.json())
      .then(data => setTransactions(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  useEffect(() => {
    if (token) loadData();
  }, [token, activeTab]);

  const handleLoginSuccess = (newToken, newUser) => {
    localStorage.setItem('aura_token', newToken);
    setToken(newToken);
    setUser(newUser);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('aura_token');
    setToken('');
    setUser(null);
    setIsAuthOpen(true); // Re-open onboard/login screen on logout
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          /* ======================================================== */
          /* INITIAL ONBOARDING / LOGIN WELCOME GATEWAY               */
          /* ======================================================== */
          <div className="max-w-4xl mx-auto py-12 space-y-10 text-center">
            {/* Hero Glow */}
            <div className="relative">
              <div className="absolute inset-0 max-w-lg mx-auto h-72 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-purple-500/20 blur-3xl rounded-full pointer-events-none" />
              
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-4">
                <Sparkles className="w-4 h-4 animate-pulse" /> Next-Gen Private Banking for GenZ (INR)
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
                Empowering Digital Natives with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 glow-text-emerald">Private Wealth Management</span>
              </h1>

              <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
                Step-by-step DOB age verification, 2FA Multi-Factor Authentication, automated Individual Savings Plans (ISP), and instant Indian Rupee (₹) wealth management.
              </p>
            </div>

            {/* Main Call To Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 hover:opacity-95 transition-all flex items-center justify-center space-x-2 group"
              >
                <UserPlus className="w-5 h-5" />
                <span>Start GenZ Onboarding Wizard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setIsAuthOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-extrabold text-sm border border-aura-border hover:border-purple-500/50 transition-all flex items-center justify-center space-x-2"
              >
                <Key className="w-5 h-5 text-purple-400" />
                <span>Sign In via Pre-Login 2FA MFA Gate</span>
              </button>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-aura-border/60">
              <div className="glass-panel p-6 rounded-3xl text-left space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">DOB Age Compliance</h3>
                <p className="text-xs text-slate-400">
                  Automatic age classification. Minor protection guardrails for &lt;18 investors with parental vault lockouts.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-3xl text-left space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Pre-Login 2FA MFA Gate</h3>
                <p className="text-xs text-slate-400">
                  Mandatory Account Number, Password, and 6-digit TOTP passcode verification before accessing any portfolio.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-3xl text-left space-y-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">GenZ Savings Plan (ISP)</h3>
                <p className="text-xs text-slate-400">
                  High-yield savings vaults (6.75% APY) with automated UPI purchase round-up stashing.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* LOGGED IN UNLOCKED PORTFOLIO DASHBOARD VIEWS             */
          /* ======================================================== */
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                summary={summary}
                accounts={accounts}
                transactions={transactions}
                onNavigate={setActiveTab}
                user={user}
              />
            )}

            {activeTab === 'savings' && (
              <GenZSavings
                plans={savingsPlans}
                accounts={accounts}
                onRefresh={loadData}
                user={user}
              />
            )}

            {activeTab === 'trading' && (
              <TradingHub
                accounts={accounts}
                portfolio={portfolio}
                onRefresh={loadData}
                user={user}
              />
            )}

            {activeTab === 'transfers' && (
              <TransfersHub
                accounts={accounts}
                onRefresh={loadData}
                user={user}
              />
            )}

            {activeTab === 'security' && (
              <SecurityKyc
                user={user}
                onRefresh={loadData}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-aura-border bg-[#060911] py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 Zenith Aura Private Banking & Wealth Management Suite. All Rights Reserved.</span>
          <span className="font-semibold text-emerald-400">GenZ Financial Technology Platform (INR)</span>
        </div>
      </footer>

      {/* Auth Modal (Onboard & Login Gateway) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
