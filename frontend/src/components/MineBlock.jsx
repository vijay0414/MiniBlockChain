import React, { useState, useEffect } from 'react';
import { minePendingTransactions, getMinerPublicKey } from '../api';
import { 
  Pickaxe, 
  Cpu, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Sparkles,
  Link,
  ChevronRight
} from 'lucide-react';

const MineBlock = ({ activeWallet, onBlockMined, pendingCount }) => {
  const [minerAddress, setMinerAddress] = useState('');
  const [mining, setMining] = useState(false);
  const [minedBlock, setMinedBlock] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeWallet) {
      setMinerAddress(activeWallet.publicKey);
    } else {
      // Fetch default miner public key from backend if possible
      getMinerPublicKey()
        .then(res => {
          if (res.data && res.data.publicKey) {
            setMinerAddress(res.data.publicKey);
          }
        })
        .catch(() => {});
    }
  }, [activeWallet]);

  const handleMine = async (e) => {
    e.preventDefault();
    if (!minerAddress.trim()) {
      setError("Please specify a Miner Reward Address.");
      return;
    }

    setMining(true);
    setMinedBlock(null);
    setError(null);

    try {
      const res = await minePendingTransactions(minerAddress.trim());
      // Returns mined Block { index: x, hash: "...", previousHash: "...", nonce: ..., transactions: [...] }
      setMinedBlock(res.data);
      if (onBlockMined) {
        onBlockMined();
      }
    } catch (err) {
      console.error(err);
      setError("Mining failed. Verify backend connectivity and try again.");
    } finally {
      setMining(false);
    }
  };

  const handleUseActiveWallet = () => {
    if (activeWallet) {
      setMinerAddress(activeWallet.publicKey);
      setError(null);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:border-amber-500/30">
      <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Pickaxe className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white tracking-wide">Network Mining</h3>
        </div>
        {activeWallet && minerAddress !== activeWallet.publicKey && (
          <button 
            onClick={handleUseActiveWallet}
            className="text-[10px] px-2.5 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 rounded-md font-bold transition-all uppercase tracking-wider"
          >
            Use Active Wallet
          </button>
        )}
      </div>

      <form onSubmit={handleMine} className="space-y-4">
        {/* Miner Reward Address input */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Miner Reward Address
            </label>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
              Reward: 50 BCOINS
            </span>
          </div>
          <input 
            type="text"
            placeholder="Address to receive mined BCOINS..."
            value={minerAddress}
            onChange={(e) => setMinerAddress(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-xl py-3 px-4 text-xs font-mono text-slate-300 placeholder:text-slate-600 outline-none transition-colors"
            required
          />
        </div>

        {/* Dynamic Pending transactions display */}
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Mempool Backlog</span>
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-amber-400" />
              {pendingCount} Transaction{pendingCount !== 1 ? 's' : ''} Pending
            </span>
          </div>
          {pendingCount > 0 ? (
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold animate-pulse">
              Ready to Mine
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-500 font-medium">
              Idle
            </span>
          )}
        </div>

        {/* Mine button */}
        <button
          type="submit"
          disabled={mining}
          className={`w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-70 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 ${
            mining ? 'cursor-not-allowed animate-pulse' : 'active:scale-[0.98]'
          }`}
        >
          {mining ? (
            <>
              <Activity className="w-4 h-4 animate-spin text-white" />
              <span>Solving Cryptographic Puzzle...</span>
            </>
          ) : (
            <>
              <Pickaxe className="w-4 h-4" />
              <span>Start Mining Block</span>
            </>
          )}
        </button>
      </form>

      {/* Success Alert / Mined block info */}
      {minedBlock && (
        <div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-3 animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
            <CheckCircle className="w-4 h-4" />
            <span>Success! New Block Mined</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-emerald-500/10 pt-2 text-slate-400">
            <div>
              <span className="text-slate-500 font-bold uppercase block">Block Number</span>
              <span className="text-white text-xs font-bold font-sans flex items-center gap-1">
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                #{minedBlock.index || "Latest"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase block">Nonce Puzzle</span>
              <span className="text-white text-xs font-bold">{minedBlock.nonce || "N/A"}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 font-bold uppercase block">Mined Block Hash</span>
              <span className="text-emerald-400 text-xs break-all leading-normal">{minedBlock.hash}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default MineBlock;
