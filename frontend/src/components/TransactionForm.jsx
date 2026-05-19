import React, { useState, useEffect } from 'react';
import { addTransaction, signTransactionData } from '../api';
import { 
  Send, 
  HelpCircle, 
  Sparkles, 
  Key, 
  Coins, 
  AlertCircle, 
  CheckCircle,
  FileSignature
} from 'lucide-react';

const TransactionForm = ({ activeWallet, onTransactionAdded }) => {
  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [signature, setSignature] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Status message { type: 'success' | 'error', text: '...' }
  const [status, setStatus] = useState(null);

  // Auto-fill active wallet public key as sender
  useEffect(() => {
    if (activeWallet) {
      setSender(activeWallet.publicKey);
      setPrivateKey(activeWallet.privateKey || '');
    }
  }, [activeWallet]);

  const handleSignTransaction = async () => {
    if (!sender || !receiver || !amount) {
      setStatus({ type: 'error', text: 'Fill in Sender, Receiver, and Amount before signing.' });
      return;
    }
    if (parseFloat(amount) <= 0) {
      setStatus({ type: 'error', text: 'Amount must be positive.' });
      return;
    }
    
    const keyToUse = privateKey || (activeWallet ? activeWallet.privateKey : '');
    if (!keyToUse) {
      setStatus({ type: 'error', text: 'Private Key is required to sign this transaction.' });
      return;
    }

    setIsSigning(true);
    setStatus(null);
    try {
      const res = await signTransactionData({
        sender,
        receiver,
        amount: parseFloat(amount),
        privateKey: keyToUse
      });
      // Returns { transactionId: "...", signature: "..." }
      setSignature(res.data.signature);
      setStatus({ type: 'success', text: 'Transaction signed successfully!' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', text: 'Signing failed: Ensure Private Key is correct.' });
    } finally {
      setIsSigning(false);
    }
  };

  const handleSendTransaction = async (e) => {
    e.preventDefault();
    if (!sender.trim() || !receiver.trim() || !amount) {
      setStatus({ type: 'error', text: 'All fields except signature are required.' });
      return;
    }
    
    const finalAmount = parseFloat(amount);
    if (finalAmount <= 0) {
      setStatus({ type: 'error', text: 'Amount must be a positive number.' });
      return;
    }

    if (sender !== 'SYSTEM' && !signature) {
      setStatus({ 
        type: 'error', 
        text: 'Non-system transactions must be signed. Enter or generate a signature.' 
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      await addTransaction({
        sender: sender.trim(),
        receiver: receiver.trim(),
        amount: finalAmount,
        signature: sender === 'SYSTEM' ? null : signature.trim()
      });
      
      setStatus({ type: 'success', text: 'Transaction successfully broadcasted to Mempool!' });
      setReceiver('');
      setAmount('');
      setSignature('');
      
      if (onTransactionAdded) {
        onTransactionAdded();
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data || 'Failed to submit transaction.';
      setStatus({ type: 'error', text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleUseSystem = () => {
    setSender('SYSTEM');
    setSignature('');
    setStatus(null);
  };

  const handleUseActiveWallet = () => {
    if (activeWallet) {
      setSender(activeWallet.publicKey);
      setPrivateKey(activeWallet.privateKey);
      setStatus(null);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:border-emerald-500/30">
      <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white tracking-wide">Create Transaction</h3>
        </div>
        <div className="flex gap-1.5">
          <button 
            type="button"
            onClick={handleUseSystem}
            className="text-[10px] px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 rounded-md font-bold transition-all uppercase tracking-wider"
          >
            Use System
          </button>
          {activeWallet && sender !== activeWallet.publicKey && (
            <button 
              type="button"
              onClick={handleUseActiveWallet}
              className="text-[10px] px-2.5 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 rounded-md font-bold transition-all uppercase tracking-wider"
            >
              Use Wallet
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSendTransaction} className="space-y-4">
        {/* Sender Field */}
        <div className="space-y-1">
          <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Sender Address</label>
          <input 
            type="text"
            placeholder="Active Wallet Public Key or 'SYSTEM'"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-xs font-mono text-slate-300 placeholder:text-slate-600 outline-none transition-colors"
            required
          />
        </div>

        {/* Receiver Field */}
        <div className="space-y-1">
          <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Receiver Address</label>
          <input 
            type="text"
            placeholder="Recipient's Public Key"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-xs font-mono text-slate-300 placeholder:text-slate-600 outline-none transition-colors"
            required
          />
        </div>

        {/* Amount & Key Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-emerald-400" /> Amount
            </label>
            <input 
              type="number"
              step="any"
              placeholder="e.g. 10.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-xs font-mono text-white placeholder:text-slate-600 outline-none transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-rose-400" /> Sign Key (Optional)
            </label>
            <input 
              type="password"
              placeholder="Private Key (For signing)"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-xs font-mono text-slate-300 placeholder:text-slate-600 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Signature Box */}
        {sender !== 'SYSTEM' && (
          <div className="space-y-1 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <FileSignature className="w-3.5 h-3.5 text-amber-400" /> Cryptographic Signature
              </label>
              <button
                type="button"
                onClick={handleSignTransaction}
                disabled={isSigning}
                className="text-[10px] px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 rounded-md font-bold transition-all uppercase tracking-wider"
              >
                {isSigning ? "Signing..." : "Sign Tx"}
              </button>
            </div>
            <textarea 
              rows="2"
              placeholder="Signature will be automatically generated, or input manually..."
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500 rounded-xl p-2.5 text-[10px] font-mono text-slate-300 placeholder:text-slate-700 outline-none transition-colors resize-none"
            />
          </div>
        )}

        {/* Feedback Alert Box */}
        {status && (
          <div className={`p-3 rounded-xl text-xs flex items-start gap-2 animate-in fade-in slide-in-from-top-1 ${
            status.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {status.type === 'success' ? (
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            )}
            <span>{status.text}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-500/10 active:scale-[0.98]"
        >
          {loading ? "Broadcasting..." : "Sign & Send Transaction"}
        </button>
      </form>

      {/* Helper Box */}
      <div className="mt-4 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 flex gap-2">
        <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-300/80 leading-relaxed">
          <span className="font-bold">Tip:</span> Transactions from <code className="text-amber-200">SYSTEM</code> address bypass signature verification. Use this to easily mint funds to any new wallet first!
        </p>
      </div>
    </div>
  );
};

export default TransactionForm;
