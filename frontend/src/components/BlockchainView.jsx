import React, { useState } from 'react';
import { 
  Database, 
  Link, 
  ChevronRight, 
  Coins, 
  Tag, 
  FileText, 
  Hash, 
  Activity, 
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCcw,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

const BlockchainView = ({ chain, onRefresh }) => {
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [copiedKeyIdx, setCopiedKeyIdx] = useState(null);

  const triggerCopy = (text, type, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyIdx(`${type}-${idx}`);
    setTimeout(() => setCopiedKeyIdx(null), 1500);
  };

  const truncateKey = (key, length = 12) => {
    if (!key) return '';
    if (key.length <= length * 2) return key;
    return `${key.substring(0, length)}...${key.substring(key.length - length)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header section with status metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-400 custom-glow animate-pulse" />
            Distributed Ledger Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable blockchain records and verified states
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 text-[10px] font-bold uppercase tracking-wider">
            <span className="px-3 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-lg">
              Height: {chain ? chain.length : 0}
            </span>
          </div>
          <button 
            onClick={onRefresh}
            className="p-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all active:scale-95"
            title="Reload Chain"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal chain block visualization flow */}
      <div className="relative">
        <div className="overflow-x-auto pb-4 flex gap-6 items-stretch scrollbar-thin scrollbar-thumb-sky-500/20">
          {chain && chain.length > 0 ? (
            chain.map((block, index) => {
              const isGenesis = index === 0;
              return (
                <div key={block.hash || index} className="flex items-center flex-shrink-0">
                  {/* Block Card */}
                  <div 
                    onClick={() => setSelectedBlock(block)}
                    className={`glass-card rounded-2xl p-5 w-80 cursor-pointer border-2 hover-glow transition-all duration-300 ${
                      selectedBlock && selectedBlock.hash === block.hash 
                        ? 'border-sky-500 bg-slate-900/90' 
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] px-2.5 py-0.5 bg-slate-950 text-sky-400 font-black tracking-widest font-mono rounded border border-slate-800">
                        BLOCK #{block.index !== undefined ? block.index : index}
                      </span>
                      {isGenesis ? (
                        <span className="text-[9px] font-black uppercase text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 tracking-widest">
                          Genesis
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase text-slate-500 px-2 py-0.5 rounded bg-slate-950 tracking-wider">
                          Mined
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Hash Signature</span>
                        <div className="font-mono text-xs text-sky-300 break-all bg-slate-950 p-2 rounded-lg border border-slate-900/40 mt-1 select-all">
                          {block.hash ? block.hash.substring(0, 18) + "..." : "N/A"}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[10px]">
                        <div>
                          <span className="text-slate-500 font-bold uppercase tracking-wider block">Nonce Puzzle</span>
                          <span className="text-white font-mono">{block.nonce !== undefined ? block.nonce : '0'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold uppercase tracking-wider block">Transactions</span>
                          <span className="text-white font-bold">{block.transactions ? block.transactions.length : 0} Items</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-800/80 pt-3 flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Merkle Root</span>
                        <span className="font-mono text-slate-500 text-[10px]">
                          {block.merkleRoot ? truncateKey(block.merkleRoot, 5) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Connective Arrow pointing to next block (or previous link block) */}
                  {index < chain.length - 1 && (
                    <div className="flex flex-col items-center justify-center text-slate-600 px-2">
                      <ArrowRight className="w-5 h-5 text-sky-500/50 animate-[pulse_2s_infinite]" />
                      <span className="text-[8px] font-black uppercase text-slate-700 tracking-wider mt-1">link</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="w-full text-center py-12 glass-card rounded-2xl border border-dashed border-slate-800 space-y-3">
              <Database className="w-12 h-12 text-slate-600 mx-auto" />
              <div>
                <h4 className="text-white font-bold">Ledger Empty</h4>
                <p className="text-xs text-slate-500">Submit transactions and mine to create new blocks.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Detailed Selected Block Inspection Drawer */}
      {selectedBlock && (
        <div className="glass-card-accent rounded-2xl p-6 border border-slate-800/80 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800/80">
            <div>
              <h3 className="text-md font-bold text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-400" />
                Block #{selectedBlock.index} Complete Manifest
              </h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Fully decoded cryptographic block state
              </p>
            </div>
            <button 
              onClick={() => setSelectedBlock(null)}
              className="text-xs text-slate-500 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Current Block Hash</span>
                <span className="font-mono text-sky-300 select-all">{selectedBlock.hash}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Previous Block Hash</span>
                <span className="font-mono text-slate-400 select-all">{selectedBlock.previousHash || "0"}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Merkle Tree Root</span>
                <span className="font-mono text-slate-400 select-all">{selectedBlock.merkleRoot || "N/A"}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Nonce Verified</span>
                <span className="font-bold text-white font-mono">{selectedBlock.nonce}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Block Timestamp</span>
                <span className="text-white font-mono">{selectedBlock.timeStamp || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Integrity Status</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-black text-[9px] uppercase tracking-wider">
                  Verified True
                </span>
              </div>
            </div>
          </div>

          {/* Mined Block Transactions List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Decoded Transactions ({selectedBlock.transactions ? selectedBlock.transactions.length : 0})</h4>
            <div className="bg-slate-950 rounded-xl border border-slate-900/60 overflow-hidden divide-y divide-slate-900/40 max-h-60 overflow-y-auto">
              {selectedBlock.transactions && selectedBlock.transactions.length > 0 ? (
                selectedBlock.transactions.map((tx, idx) => {
                  const isSystem = tx.sender === 'SYSTEM';
                  return (
                    <div key={tx.transactionId || idx} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isSystem 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        }`}>
                          {isSystem ? 'SYS' : 'TX'}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            <span 
                              className="font-bold text-white cursor-pointer hover:text-sky-400 transition-colors"
                              title="Click to copy Sender"
                              onClick={() => !isSystem && triggerCopy(tx.sender, 'block-sender', idx)}
                            >
                              {isSystem ? 'SYSTEM (Mint)' : truncateKey(tx.sender, 5)}
                            </span>
                            {!isSystem && (
                              <button 
                                onClick={() => triggerCopy(tx.sender, 'block-sender', idx)}
                                className="text-slate-500 hover:text-white transition-colors"
                                type="button"
                              >
                                {copiedKeyIdx === `block-sender-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            )}

                            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />

                            <span 
                              className="font-bold text-white cursor-pointer hover:text-sky-400 transition-colors"
                              title="Click to copy Receiver"
                              onClick={() => triggerCopy(tx.receiver, 'block-receiver', idx)}
                            >
                              {truncateKey(tx.receiver, 5)}
                            </span>
                            <button 
                              onClick={() => triggerCopy(tx.receiver, 'block-receiver', idx)}
                              className="text-slate-500 hover:text-white transition-colors"
                              type="button"
                            >
                              {copiedKeyIdx === `block-receiver-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span 
                              className="text-[9px] font-mono text-slate-500 cursor-pointer hover:text-slate-300 transition-colors truncate max-w-[200px]"
                              onClick={() => triggerCopy(tx.transactionId, 'block-txid', idx)}
                              title="Click to copy Transaction ID"
                            >
                              ID: {tx.transactionId}
                            </span>
                            <button 
                              onClick={() => triggerCopy(tx.transactionId, 'block-txid', idx)}
                              className="text-slate-700 hover:text-slate-400 transition-colors"
                              type="button"
                            >
                              {copiedKeyIdx === `block-txid-${idx}` ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                            </button>
                          </div>
                        </div>

                      </div>
                      <div className="text-right">
                        <span className="font-black text-white font-mono text-xs">{tx.amount} BCOIN</span>
                        <span className="text-[9px] text-slate-600 block uppercase font-bold tracking-wider mt-0.5">Validated</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 font-medium">
                  No transactions recorded in this block.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainView;
