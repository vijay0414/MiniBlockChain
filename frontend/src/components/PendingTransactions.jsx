import React, { useState } from 'react';
import { 
  Hourglass, 
  ArrowRight, 
  Cpu, 
  HelpCircle,
  HelpCircle as QuestionIcon,
  Copy,
  Check
} from 'lucide-react';

const PendingTransactions = ({ pendingTransactions, onRefresh }) => {
  const truncateKey = (key, length = 10) => {
    if (!key) return '';
    if (key.length <= length * 2) return key;
    return `${key.substring(0, length)}...${key.substring(key.length - length)}`;
  };

  const [copiedTxIdx, setCopiedTxIdx] = useState(null);

  const triggerCopy = (text, type, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedTxIdx(`${type}-${idx}`);
    setTimeout(() => setCopiedTxIdx(null), 1500);
  };

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:border-amber-500/30">
      <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Hourglass className="w-5 h-5 text-amber-400 animate-spin" />
          <div>
            <h3 className="text-md font-bold text-white tracking-wide">Mempool Pool</h3>
            <p className="text-[10px] text-slate-400 font-medium">Pending blockchain transactions</p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black font-mono">
          Size: {pendingTransactions ? pendingTransactions.length : 0}
        </span>
      </div>

      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {pendingTransactions && pendingTransactions.length > 0 ? (
          pendingTransactions.map((tx, idx) => {
            const isSystem = tx.sender === 'SYSTEM';
            return (
              <div 
                key={tx.transactionId || idx} 
                className="bg-slate-950/60 hover:bg-slate-950 border border-slate-900 rounded-xl p-3 flex flex-col gap-2 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border tracking-wider ${
                    isSystem 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                      : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                  }`}>
                    {isSystem ? 'System Mint' : 'Signed User'}
                  </span>
                  <span className="font-mono font-bold text-xs text-white">
                    {tx.amount} BCOINS
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300 font-medium justify-between">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span 
                      className="font-mono text-[10px] truncate cursor-pointer hover:text-sky-400 transition-colors" 
                      title="Click to copy Sender"
                      onClick={() => !isSystem && triggerCopy(tx.sender, 'sender', idx)}
                    >
                      {isSystem ? 'SYSTEM' : truncateKey(tx.sender, 5)}
                    </span>
                    {!isSystem && (
                      <button 
                        onClick={() => triggerCopy(tx.sender, 'sender', idx)}
                        className="text-slate-500 hover:text-white transition-colors"
                        type="button"
                      >
                        {copiedTxIdx === `sender-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                    <span 
                      className="font-mono text-[10px] truncate cursor-pointer hover:text-sky-400 transition-colors" 
                      title="Click to copy Receiver"
                      onClick={() => triggerCopy(tx.receiver, 'receiver', idx)}
                    >
                      {truncateKey(tx.receiver, 5)}
                    </span>
                    <button 
                      onClick={() => triggerCopy(tx.receiver, 'receiver', idx)}
                      className="text-slate-500 hover:text-white transition-colors"
                      type="button"
                    >
                      {copiedTxIdx === `receiver-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {tx.transactionId && (
                  <div className="text-[9px] font-mono text-slate-600 flex justify-between gap-2 border-t border-slate-900/60 pt-2">
                    <span className="truncate">TxID: {tx.transactionId}</span>
                  </div>
                )}
              </div>
            );
          })

        ) : (
          <div className="py-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-slate-500">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-300 font-semibold">Mempool Clear</p>
              <p className="text-[10px] text-slate-500 max-w-[180px] mx-auto">
                No transactions currently waiting to be mined.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingTransactions;
