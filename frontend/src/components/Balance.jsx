import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateNewWallet, getWalletBalance } from '../api';
import { 
  Key, 
  Copy, 
  Check, 
  RotateCcw, 
  Coins, 
  Eye, 
  EyeOff, 
  Search,
  Wallet,
  QrCode
} from 'lucide-react';

const Balance = ({ walletInfo, setWalletInfo, onRefreshBalance }) => {
  const [loading, setLoading] = useState(false);
  const [balanceInput, setBalanceInput] = useState('');
  const [inspectedBalance, setInspectedBalance] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [qrTitle, setQrTitle] = useState('');

  const triggerCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handleCreateWallet = async () => {
    setLoading(true);
    try {
      const res = await generateNewWallet();
      // res.data is { publicKey: "...", privateKey: "..." }
      const pubKey = res.data.publicKey;
      const privKey = res.data.privateKey;
      
      // Get balance of new wallet (initially 0)
      const balanceRes = await getWalletBalance(pubKey);
      
      setWalletInfo({
        publicKey: pubKey,
        privateKey: privKey,
        balance: balanceRes.data.balance
      });
      
      setBalanceInput(pubKey);
      setInspectedBalance(null);
    } catch (err) {
      console.error("Wallet generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckBalance = async (e) => {
    e.preventDefault();
    if (!balanceInput.trim()) return;
    setInspectLoading(true);
    try {
      const res = await getWalletBalance(balanceInput.trim());
      setInspectedBalance(res.data.balance);
      
      // If the searched wallet is the active one, update it
      if (walletInfo && walletInfo.publicKey === balanceInput.trim()) {
        setWalletInfo(prev => ({ ...prev, balance: res.data.balance }));
      }
    } catch (err) {
      console.error("Balance fetch failed:", err);
      setInspectedBalance(0);
    } finally {
      setInspectLoading(false);
    }
  };

  const openQR = (value, title) => {
    setQrValue(value);
    setQrTitle(title);
    setShowQRModal(true);
  };

  return (
    <div className="space-y-6">
      {/* 🔑 Active Wallet Information */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:border-sky-500/30">
        <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-sky-500/5 blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-bold text-white tracking-wide">Wallet Hub</h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20 font-medium">
            Active Session
          </span>
        </div>

        {walletInfo ? (
          <div className="space-y-4">
            {/* Balance Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-500/10 rounded-lg border border-sky-500/20">
                  <Coins className="w-6 h-6 text-sky-400 custom-glow" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Available Balance</div>
                  <div className="text-2xl font-black text-white flex items-baseline gap-1 mt-0.5">
                    {walletInfo.balance !== null ? walletInfo.balance : 0}
                    <span className="text-xs font-bold text-sky-400 font-mono">BCOINS</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onRefreshBalance}
                title="Refresh Balance"
                className="p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg text-slate-300 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Public Key Display */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  Public Key
                </span>
                <div className="flex gap-2 items-center">
                  <button 
                    onClick={() => openQR(walletInfo.publicKey, "Public Key QR")}
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-500/20"
                    type="button"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    QR
                  </button>
                  <button
                    onClick={() => triggerCopy(walletInfo.publicKey, 'public')}
                    className="text-slate-400 hover:text-white transition-colors"
                    type="button"
                    title="Copy Public Key"
                  >
                    {copiedKey === 'public' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div 
                className="bg-slate-950/80 border border-slate-800/60 rounded-lg p-2.5 font-mono text-xs break-all text-slate-300 cursor-pointer hover:border-sky-500/40 transition-colors max-h-24 overflow-y-auto"
                onClick={() => triggerCopy(walletInfo.publicKey, 'public')}
                title="Click to copy full public key"
              >
                {walletInfo.publicKey}
              </div>
              <div className="flex justify-between items-center text-[9px] text-slate-500 px-1">
                <span>RSA-2048 Public Key</span>
                <span>Click text to copy</span>
              </div>
            </div>

            {/* Private Key Display */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  Private Key (Secret)
                </span>
                <div className="flex gap-2 items-center">
                  <button 
                    onClick={() => openQR(walletInfo.privateKey, "Private Key QR")}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/20"
                    type="button"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    QR
                  </button>
                  <button 
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="text-slate-400 hover:text-white transition-colors"
                    type="button"
                    title={showPrivateKey ? "Hide Private Key" : "Reveal Private Key"}
                  >
                    {showPrivateKey ? <EyeOff className="w-4 h-4 text-rose-400" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => triggerCopy(walletInfo.privateKey, 'private')}
                    className="text-slate-400 hover:text-white transition-colors"
                    type="button"
                    title="Copy Private Key"
                  >
                    {copiedKey === 'private' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="relative">
                <div 
                  className={`bg-slate-950/80 border border-slate-800/60 rounded-lg p-2.5 font-mono text-xs break-all text-slate-300 transition-all ${
                    !showPrivateKey 
                      ? 'select-none filter blur-[5px] max-h-12 overflow-hidden' 
                      : 'cursor-pointer hover:border-rose-500/40 max-h-28 overflow-y-auto'
                  }`}
                  onClick={() => showPrivateKey && triggerCopy(walletInfo.privateKey, 'private')}
                  title={showPrivateKey ? "Click to copy full private key" : "Reveal to copy"}
                >
                  {walletInfo.privateKey}
                </div>
                {!showPrivateKey && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] bg-rose-950/50 text-rose-400 border border-rose-900/50 px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                      Hidden (Click Reveal icon to view)
                    </span>
                  </div>
                )}
              </div>
              {showPrivateKey && (
                <div className="flex justify-between items-center text-[9px] text-rose-500/70 px-1">
                  <span>PKCS8 Private Key Spec</span>
                  <span>Click text to copy</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Key className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-300 font-semibold">No Active Wallet</p>
              <p className="text-xs text-slate-500 max-w-[240px] mx-auto">
                Generate a secure RSA key pair locally to participate in the blockchain.
              </p>
            </div>
            <button
              onClick={handleCreateWallet}
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs tracking-wide uppercase transition-all shadow-lg shadow-sky-500/20 active:scale-[0.98]"
            >
              {loading ? "Generating keys..." : "Generate Secure Wallet"}
            </button>
          </div>
        )}
      </div>

      {/* 🔍 Wallet Inspector */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:border-indigo-500/30">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Search className="w-4 h-4 text-indigo-400" />
          Wallet Balance Inspector
        </h3>
        
        <form onSubmit={handleCheckBalance} className="space-y-3">
          <div className="relative">
            <input 
              type="text"
              placeholder="Search by Public Key..."
              value={balanceInput}
              onChange={(e) => setBalanceInput(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-3 pr-10 text-xs font-mono text-slate-300 placeholder:text-slate-600 outline-none transition-colors"
            />
            <button 
              type="submit"
              disabled={inspectLoading}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-white transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>

          {inspectedBalance !== null && (
            <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Searched Balance</span>
              <span className="text-sm font-bold text-white font-mono">
                {inspectedBalance} BCOINS
              </span>
            </div>
          )}
        </form>
      </div>

      {/* 📱 QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl p-8 max-w-sm w-full border border-slate-700/50 flex flex-col items-center space-y-6">
            <h4 className="text-md font-bold text-white tracking-wide uppercase">{qrTitle}</h4>
            <div className="bg-white p-4 rounded-2xl shadow-2xl">
              <QRCodeSVG value={qrValue} size={200} />
            </div>
            <div className="w-full bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono text-[10px] break-all max-h-24 overflow-y-auto text-slate-400">
              {qrValue}
            </div>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => triggerCopy(qrValue, 'modal')}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 transition-colors text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                {copiedKey === 'modal' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Key
              </button>
              <button 
                onClick={() => setShowQRModal(false)}
                className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 transition-colors text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Balance;
