import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  UploadCloud, 
  AlertCircle, 
  ShieldCheck, 
  Zap, 
  Info, 
  CheckCircle2, 
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useCurrency } from '../hooks/useCurrency';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { PaymentGatewayLogo } from '../components/PaymentGatewayLogo';

export default function Deposit() {
  const navigate = useNavigate();
  const { gateways, currentUser, addTransaction } = useApp();
  const { siteSettings } = useSiteSettings();
  const { currencySymbol, formatCurrency } = useCurrency();

  
  const activeGateways = useMemo(() => {
    return gateways.filter(gw => gw.isActive);
  }, [gateways]);
  
  const [amount, setAmount] = useState('500');
  const [method, setMethod] = useState(activeGateways[0]?.id || '');
  const [senderNumber, setSenderNumber] = useState('');
  const [txId, setTxId] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState(false);

  // Keep selected gateway in sync
  const selectedGateway = useMemo(() => {
    return activeGateways.find(g => g.id === method) || activeGateways[0];
  }, [activeGateways, method]);

  // Extract payment account number and details intelligently
  const gatewayInfo = useMemo(() => {
    if (!selectedGateway) return { number: '', type: 'Personal', isCrypto: false };
    const text = (selectedGateway.details || '') + '\n' + (selectedGateway.instructions || '');
    const name = selectedGateway.name.toLowerCase();
    const isCrypto = name.includes('binance') || name.includes('usdt') || name.includes('crypto') || name.includes('trc20');

    // Extract phone number / crypto address / ID
    let number = '';
    const phoneMatch = text.match(/(?:01[3-9]\d{8}|01\d{9})/);
    const cryptoMatch = text.match(/(T[A-Za-z0-9]{33}|0x[a-fA-F0-9]{40})/);
    const payIdMatch = text.match(/(?:Pay ID|Binance ID|ID):\s*([0-9]{6,12})/i);

    if (isCrypto) {
      number = cryptoMatch ? cryptoMatch[0] : (payIdMatch ? payIdMatch[1] : 'TXYZ99887766554433221100AABBCCDDEEFF');
    } else if (phoneMatch) {
      number = phoneMatch[0];
    } else {
      number = '01712345678';
    }

    let accType = 'Personal (Send Money)';
    if (text.toLowerCase().includes('merchant') || text.toLowerCase().includes('payment')) {
      accType = 'Merchant (Make Payment)';
    } else if (text.toLowerCase().includes('agent')) {
      accType = 'Agent (Cash Out)';
    }

    return { number, type: accType, isCrypto };
  }, [selectedGateway]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGateway) return;
    
    const numAmount = parseFloat(amount);
    const minDeposit = siteSettings?.minDeposit || selectedGateway.minAmount || 10;
    
    if (isNaN(numAmount) || numAmount < minDeposit) {
      alert(`Minimum deposit amount is ${formatCurrency(minDeposit)}`);
      return;
    }

    if (!txId.trim()) {
      alert('Please provide the Transaction ID (TrxID) from your payment app.');
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      addTransaction({
        userId: currentUser?.id,
        userName: currentUser?.name,
        type: 'deposit',
        amount: numAmount,
        method: selectedGateway.name,
        txId: txId.trim().toUpperCase(),
        userDetails: senderNumber ? `Sender: ${senderNumber}` : undefined,
        proofImg: proofFile ? proofFile.name : undefined
      });
      setIsSubmitting(false);
      setSuccessModal(true);
    }, 600);
  };

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  if (!currentUser) return null;

  return (
    <div className="space-y-4 pb-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => navigate('/wallet')} 
            className="p-2 bg-white rounded-full border border-slate-200 shadow-2xs text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-800">Deposit Funds</h2>
            <p className="text-[11px] text-slate-500">Add money to your wallet balance</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Manual 24/7 Verified</span>
        </div>
      </div>

      {activeGateways.length === 0 ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm shadow-sm">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="font-semibold text-slate-700">No payment gateways available.</p>
          <p className="text-xs text-slate-400 mt-1">Please contact support or try again later.</p>
        </div>
      ) : (
        <form onSubmit={handleDeposit} className="space-y-4">
          {/* Step 1: Select Gateway */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px]">1</span>
                Select Payment Method
              </label>
              <span className="text-[10px] font-medium text-slate-400">Choose your gateway</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeGateways.map((gw) => {
                const isSelected = (selectedGateway?.id === gw.id);
                return (
                  <div 
                    key={gw.id} 
                    onClick={() => setMethod(gw.id)} 
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs' 
                        : 'border-slate-150 bg-white hover:bg-slate-50/80 hover:border-slate-300'
                    }`}
                  >
                    <PaymentGatewayLogo name={gw.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-xs truncate ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                          {gw.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        Instant • Min {formatCurrency(gw.minAmount || siteSettings?.minDeposit || 10)}
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-indigo-600' : 'border-slate-300'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Enter Amount */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px]">2</span>
                Deposit Amount
              </label>
              <span className="text-[10px] text-slate-500">
                Min: {formatCurrency(selectedGateway?.minAmount || siteSettings?.minDeposit || 10)}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl select-none">
                {currencySymbol}
              </span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-9 pr-3 text-xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
                required
                min={selectedGateway?.minAmount || siteSettings?.minDeposit || 10}
                placeholder="0"
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q.toString())}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                    amount === q.toString() 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  +{formatCurrency(q)}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Account Number & Copy Box */}
          {selectedGateway && (
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 space-y-3.5 relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <PaymentGatewayLogo name={selectedGateway.name} size="sm" />
                  <span className="font-bold text-xs text-indigo-900">
                    {selectedGateway.name} Official Account
                  </span>
                </div>
                <span className="text-[10px] font-semibold bg-indigo-100 px-2 py-0.5 rounded-full text-indigo-700">
                  {gatewayInfo.type}
                </span>
              </div>

              {/* Number Copy Box */}
              <div className="bg-white border border-indigo-50 rounded-xl p-3 flex items-center justify-between gap-2 relative z-10 shadow-sm">
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">
                    {gatewayInfo.isCrypto ? 'Wallet Address / Pay ID' : 'Account Number'}
                  </p>
                  <p className="font-mono font-bold text-sm sm:text-base text-slate-800 tracking-wider truncate mt-0.5 select-all">
                    {gatewayInfo.number}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(gatewayInfo.number, 'acc_num')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 cursor-pointer shadow-sm ${
                    copiedKey === 'acc_num' 
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                  }`}
                >
                  {copiedKey === 'acc_num' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Number</span>
                    </>
                  )}
                </button>
              </div>

              {/* Amount Copy Box */}
              <div className="bg-white border border-indigo-50 rounded-xl p-2.5 flex items-center justify-between gap-2 relative z-10 shadow-sm">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Amount to Send</p>
                  <p className="font-bold text-sm text-slate-800">{formatCurrency(amount || '0')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(amount || '0', 'acc_amount')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex-shrink-0 cursor-pointer ${
                    copiedKey === 'acc_amount' 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {copiedKey === 'acc_amount' ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Amount</span>
                    </>
                  )}
                </button>
              </div>

              {/* How to Pay Step-by-Step Instructions */}
              <div className="bg-white/60 border border-indigo-100/50 rounded-xl p-3 space-y-2 relative z-10">
                <p className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Payment Instructions (পেমেন্ট নিয়মাবলী)
                </p>
                <div className="text-[11px] text-slate-700 whitespace-pre-wrap font-sans leading-relaxed space-y-1">
                  {selectedGateway.instructions || selectedGateway.details || (
                    gatewayInfo.isCrypto
                      ? `1. Open your crypto app (Binance / TrustWallet)\n2. Send exact amount to the TRC20/BEP20 address or Binance Pay ID above\n3. Copy the TxID / Transaction Hash\n4. Paste below and submit`
                      : `1. আপনার ${selectedGateway.name} অ্যাপ ওপেন করুন\n2. "Send Money" অপশনে যান\n3. উপরের নাম্বারে সঠিক পরিমাণ টাকা সেন্ড করুন\n4. সফল হলে প্রাপ্ত TrxID (Transaction ID) নিচে দিন`
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Verification Inputs */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px]">3</span>
                Payment Confirmation
              </label>
              <span className="text-[10px] text-slate-400">TrxID is mandatory</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Transaction ID / TrxID <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                value={txId}
                onChange={(e) => setTxId(e.target.value.toUpperCase())}
                placeholder={gatewayInfo.isCrypto ? 'e.g. 8a3f9e... or Internal Transfer ID' : 'e.g. BL92XK9982 (10-character code)'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all uppercase tracking-wider"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Sender Number / Wallet Account (Optional)
              </label>
              <input 
                type="text" 
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                placeholder="The number / wallet you paid from"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Screenshot / Proof Image (Optional)
              </label>
              <label className="flex flex-col items-center justify-center w-full py-4 px-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 hover:border-indigo-300 transition-colors">
                <UploadCloud className="w-6 h-6 mb-1 text-slate-400" />
                <p className="text-xs text-slate-600">
                  <span className="font-bold text-indigo-600">Click to upload</span> screenshot
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {proofFile ? proofFile.name : 'PNG, JPG, JPEG (Max 5MB)'}
                </p>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isSubmitting || !amount || !txId.trim()}
            className="w-full bg-indigo-600 text-white font-bold py-3.5 px-4 text-sm rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting Deposit...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Submit Deposit ({formatCurrency(amount || '0')})</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">Deposit Submitted!</h3>
              <p className="text-xs text-slate-500">
                Your deposit of <span className="font-bold text-slate-800">{formatCurrency(amount)}</span> via {selectedGateway?.name} has been recorded.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-500">
                <span>TrxID:</span>
                <span className="font-bold text-slate-800">{txId}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Status:</span>
                <span className="font-bold text-amber-600">Pending Review</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Admin will verify the transaction and approve the funds to your balance shortly.
            </p>

            <button
              onClick={() => navigate('/wallet')}
              className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-xs"
            >
              Go to Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
