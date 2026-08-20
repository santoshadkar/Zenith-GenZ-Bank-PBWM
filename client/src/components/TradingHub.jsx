import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShieldAlert, 
  Lock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Coins
} from 'lucide-react';

export default function TradingHub({ accounts, portfolio, onRefresh, user }) {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [orderType, setOrderType] = useState('BUY');
  const [shares, setShares] = useState('10');
  const [fundingAccount, setFundingAccount] = useState(accounts[0]?.id || '');
  const [mfaCode, setMfaCode] = useState('');
  const [requireMfa, setRequireMfa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch('/api/trading/assets')
      .then(res => res.json())
      .then(data => {
        setAssets(data);
        if (data.length > 0) setSelectedAsset(data[0]);
      })
      .catch(console.error);
  }, []);

  const totalCost = selectedAsset ? parseFloat(shares || 0) * selectedAsset.price : 0;
  const isHighValue = totalCost >= 100000; // Step-up MFA threshold >= ₹1,00,000

  const handleExecuteTrade = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/trading/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('aura_token')}`
        },
        body: JSON.stringify({
          symbol: selectedAsset.symbol,
          name: selectedAsset.name,
          assetType: selectedAsset.type,
          orderType,
          shares: parseFloat(shares),
          price: selectedAsset.price,
          accountId: fundingAccount,
          mfaCode
        })
      });

      const data = await res.json();

      if (res.status === 422 && data.error === 'MFA_REQUIRED') {
        setRequireMfa(true);
        setErrorMsg('Step-Up MFA Required for trades over ₹1,00,000. Click "Generate MFA Code" to receive 6-digit passcode.');
      } else if (!res.ok) {
        if (data.error === 'AGE_RESTRICTION') {
          setErrorMsg(`⛔ ${data.message}`);
        } else {
          setErrorMsg(data.error || data.message || 'Trade execution failed');
        }
      } else {
        setSuccessMsg(data.message);
        setRequireMfa(false);
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
        setSuccessMsg(`Simulated MFA Authenticator Code Generated: [ ${data.otpCode} ]`);
      }
    } catch (err) {
      setErrorMsg('Failed to generate MFA code');
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
              <BarChart3 className="w-4 h-4" />
              <span>Simulated Wealth & Trading Engine (INR)</span>
              {user?.isMinor && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  <ShieldAlert className="w-3 h-3 inline mr-1" /> Minor Protection Active
                </span>
              )}
            </div>
            <h1 className="mt-2 text-3xl font-extrabold text-white tracking-tight">
              Equities, ETFs & Digital Assets
            </h1>
            <p className="mt-1 text-xs text-slate-300 max-w-xl">
              Execute fractional asset trades in Indian Rupees (₹), manage multi-currency holdings, and experience step-up MFA and age-check safeguards.
            </p>
          </div>
        </div>
      </div>

      {user?.isMinor && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold block text-amber-200">Regulatory Age Guard Notice (Minor Investor &lt; 18 Yrs):</span>
            High-risk crypto assets (BTC, ETH, SOL) and margin trading are restricted for minor accounts. Stocks & ETFs remain available.
          </div>
        </div>
      )}

      {/* Main Grid: Asset Catalog & Order Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Catalog (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center">
            <Coins className="w-4 h-4 mr-2 text-cyan-400" /> Featured Wealth Assets (INR)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assets.map((asset) => {
              const isSelected = selectedAsset?.symbol === asset.symbol;
              const isCrypto = asset.type === 'Crypto';
              const isRestrictedForMinor = user?.isMinor && isCrypto;

              return (
                <div 
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset)}
                  className={`glass-panel p-5 rounded-2xl cursor-pointer transition-all border ${
                    isSelected ? 'border-emerald-500/60 bg-slate-900/90 shadow-lg shadow-emerald-500/10' : 'hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-lg text-white">{asset.symbol}</span>
                      <p className="text-xs text-slate-400 font-medium">{asset.name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      asset.changePct >= 0 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {asset.changePct >= 0 ? '+' : ''}{asset.changePct}%
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-xl font-extrabold text-white">
                      ₹{asset.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{asset.category}</span>
                  </div>

                  {isRestrictedForMinor && (
                    <div className="mt-3 text-[10px] text-amber-400 font-bold flex items-center">
                      <Lock className="w-3 h-3 mr-1" /> Age Restricted for Minors
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Portfolio Holdings */}
          <div className="glass-panel p-6 rounded-3xl mt-6">
            <h3 className="text-sm font-bold text-white mb-4">Your Active Portfolio Holdings</h3>
            <div className="space-y-3">
              {portfolio.map((item) => {
                const totalValue = item.quantity * item.current_price;
                const gain = (item.current_price - item.avg_buy_price) * item.quantity;

                return (
                  <div key={item.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-aura-border">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs border border-purple-500/20">
                        {item.symbol}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{item.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {item.quantity} Shares @ Avg ₹{item.avg_buy_price.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-extrabold text-white">
                        ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`text-[10px] font-bold ${gain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {gain >= 0 ? '+' : ''}₹{gain.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Trade Execution Desk (1 col) */}
        {selectedAsset && (
          <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between border-cyan-500/30">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-emerald-400" /> Order Desk
                </h3>
                <span className="text-xs font-bold text-cyan-400">{selectedAsset.symbol}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-xl border border-aura-border mb-4">
                <button
                  type="button"
                  onClick={() => setOrderType('BUY')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    orderType === 'BUY' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  BUY {selectedAsset.symbol}
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('SELL')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    orderType === 'SELL' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SELL {selectedAsset.symbol}
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleExecuteTrade} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Select Funding Account</label>
                  <select
                    value={fundingAccount}
                    onChange={(e) => setFundingAccount(e.target.value)}
                    className="w-full bg-slate-900 border border-aura-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.account_type} (₹{acc.balance.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Shares / Units</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    className="w-full bg-slate-900 border border-aura-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-aura-border space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Market Price per share:</span>
                    <span className="font-semibold text-white">₹{selectedAsset.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Estimated Order Value:</span>
                    <span className="font-extrabold text-emerald-400 text-sm">₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {isHighValue && (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                    <div className="text-xs font-bold text-purple-300 flex items-center">
                      <Lock className="w-3.5 h-3.5 mr-1" /> High-Value Trade (&gt; ₹1,00,000): MFA Step-Up Required
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="6-digit MFA Code"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value)}
                        className="w-full bg-slate-900 border border-aura-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateMfa}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] shrink-0"
                      >
                        Generate MFA
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || (user?.isMinor && selectedAsset.type === 'Crypto')}
                  className={`w-full py-3 rounded-xl font-bold text-xs shadow-lg transition-all ${
                    orderType === 'BUY'
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
                      : 'bg-rose-500 text-white hover:bg-rose-400 shadow-rose-500/20'
                  } ${user?.isMinor && selectedAsset.type === 'Crypto' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Executing Trade...' : `Execute ${orderType} Order`}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
