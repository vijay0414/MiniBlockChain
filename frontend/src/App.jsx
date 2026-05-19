import React, { useState, useEffect } from 'react';
import { 
  getChain, 
  getPendingTransactions, 
  getWalletBalance, 
  checkChainValidity 
} from './api';
import Balance from './components/Balance';
import TransactionForm from './components/TransactionForm';
import MineBlock from './components/MineBlock';
import BlockchainView from './components/BlockchainView';
import PendingTransactions from './components/PendingTransactions';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldQuestion, 
  Database, 
  Activity, 
  RefreshCcw,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

function App() {
  const [chain, setChain] = useState([]);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [walletInfo, setWalletInfo] = useState(null); // { publicKey, privateKey, balance }
  const [chainValid, setChainValid] = useState(null); // null | true | false
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  const fetchBlockchainState = async () => {
    setLoading(true);
    try {
      // 1. Fetch chain
      const chainRes = await getChain();
      setChain(chainRes.data);

      // 2. Fetch pending mempool
      const pendingRes = await getPendingTransactions();
      setPendingTransactions(pendingRes.data);

      // 3. Fetch current wallet balance if active
      if (walletInfo && walletInfo.publicKey) {
        const balanceRes = await getWalletBalance(walletInfo.publicKey);
        setWalletInfo(prev => ({ ...prev, balance: balanceRes.data.balance }));
      }

      // 4. Validate chain state
      const validateRes = await checkChainValidity();
      setChainValid(validateRes.data.isValid);
    } catch (err) {
      console.error("Failed to sync blockchain data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateChain = async () => {
    setValidating(true);
    try {
      const res = await checkChainValidity();
      setChainValid(res.data.isValid);
    } catch (err) {
      console.error("Validation service failed:", err);
      setChainValid(false);
    } finally {
      setTimeout(() => setValidating(false), 800); // Small delay for nice visual impact
    }
  };

  useEffect(() => {
    fetchBlockchainState();
  }, []);

  return (
    <div className="min-h-screen pb-12">
      {/* 🚀 Sleek Header Bar */}
      <header className="sticky top-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-slate-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 rounded-xl border border-sky-500/20 text-sky-400">
              <Database className="w-6 h-6 custom-glow animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                BlockMint
                <span className="text-sky-400 text-xs px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 font-bold uppercase tracking-widest font-sans">
                  Explorer
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">
                Localhost Sandbox Node • v1.0.0
              </p>
            </div>
          </div>

          {/* Action buttons & integrity check badge */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sync button */}
            <button 
              onClick={fetchBlockchainState}
              disabled={loading}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
              Sync Node
            </button>

            {/* Validation trigger button */}
            <button 
              onClick={handleValidateChain}
              disabled={validating}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all active:scale-95 flex items-center gap-2"
            >
              {validating ? "Scanning ledger..." : "Validate Ledger"}
            </button>

            {/* Integrity Badge */}
            {chainValid === true && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                ✔ Blockchain Valid
              </div>
            )}
            {chainValid === false && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-xs uppercase tracking-wider animate-bounce">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                ✘ Chain Tampered
              </div>
            )}
            {chainValid === null && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 font-bold text-xs uppercase tracking-wider">
                <ShieldQuestion className="w-4 h-4" />
                Unverified
              </div>
            )}
          </div>

        </div>
      </header>

      {/* 📊 Main Content Frame */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        
        {/* High-level Network Statistics */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatWidget title="Total Blocks" value={chain.length} desc="Ledger Height" icon={<Database className="text-sky-400" />} />
          <StatWidget title="Mempool Tx" value={pendingTransactions.length} desc="Pending Mining" icon={<Activity className="text-amber-400" />} />
          <StatWidget title="Peer Nodes" value="1" desc="Active Sandbox" icon={<LinkIcon className="text-indigo-400" />} />
          <StatWidget title="Active Wallet" value={walletInfo ? "Connected" : "Guest Mode"} desc={walletInfo ? `${walletInfo.balance} BCOIN` : "No Key Binds"} icon={<Sparkles className="text-emerald-400" />} />
        </section>

        {/* Action Panel Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Wing (Wallet & Payment Hub) */}
          <div className="lg:col-span-6 space-y-8">
            <Balance 
              walletInfo={walletInfo} 
              setWalletInfo={setWalletInfo} 
              onRefreshBalance={fetchBlockchainState} 
            />
            <TransactionForm 
              activeWallet={walletInfo} 
              onTransactionAdded={fetchBlockchainState} 
            />
          </div>

          {/* Right Wing (Mempool & Mining Portal) */}
          <div className="lg:col-span-6 space-y-8">
            <MineBlock 
              activeWallet={walletInfo} 
              onBlockMined={fetchBlockchainState} 
              pendingCount={pendingTransactions.length} 
            />
            <PendingTransactions 
              pendingTransactions={pendingTransactions} 
              onRefresh={fetchBlockchainState} 
            />
          </div>
        </section>

        {/* Horizontal Block Ledger Flow (MOST IMPORTANT Section) */}
        <section className="border-t border-slate-900 pt-8">
          <BlockchainView 
            chain={chain} 
            onRefresh={fetchBlockchainState} 
          />
        </section>

      </main>
    </div>
  );
}

// Inline Helper Stat Widget Component
const StatWidget = ({ title, value, desc, icon }) => (
  <div className="glass-card rounded-2xl p-5 border border-slate-900 flex items-center justify-between transition-all duration-300 hover:border-slate-800">
    <div className="space-y-1">
      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">{title}</span>
      <span className="text-2xl font-black text-white block">{value}</span>
      <span className="text-[10px] text-slate-400 block">{desc}</span>
    </div>
    <div className="p-3 bg-slate-950/80 border border-slate-900 rounded-xl">
      {icon}
    </div>
  </div>
);

export default App;
