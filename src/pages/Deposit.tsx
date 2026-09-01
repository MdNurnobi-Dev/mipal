import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  UploadCloud, 
  AlertCircle, 
  ShieldCheck, 
  Info, 
  CheckCircle2
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

  const selectedGateway = useMemo(() => {
    return activeGateways.find(g => g.id === method) || activeGateways[0];
  }, [activeGateways, method]);

  const gatewayInfo = useMemo(() => {
    if (!selectedGateway) return { number: '', type: 'Personal', isCrypto: false };
    const text = (selectedGateway.details || '') + '\n' + (selectedGateway.instructions || '');
    const name = selectedGateway.name.toLowerCase();
    const isCrypto = name.includes('binance') || name.includes('usdt') || name.includes('crypto') || name.includes('trc20');

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
    <div className="space-y-3 pb-8 max-w-lg mx-auto font-sans">
      {/* Compact Header */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => navigate('/wallet')} 
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors border border-transparent hover:border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-[13px] font-black text-slate-800">Deposit Funds</h2>
            <p className="text-[10px] text-slate-500 font-medium">Add money to balance</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-bold px-2 py-1 rounded-md shadow-sm">
          <ShieldCheck className="w-3 h-3" />
          <span>Secured</span>
        </div>
      </div>

      {activeGateways.length === 0 ? (
        <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-500 shadow-sm flex flex-col items-center justify-center">
          <AlertCircle className="w-6 h-6 text-amber-500 mb-2" />
          <p className="text-[11px] font-bold text-slate-700">No gateways available</p>
          <p className="text-[9px] text-slate-400 mt-1">Please try again later.</p>
        </div>
      ) : (
        <form onSubmit={handleDeposit} className="space-y-3">
          {/* Step 1: Gateway Selection */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[8px]">1</span>
                Payment Method
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {activeGateways.map((gw) => {
                const isSelected = (selectedGateway?.id === gw.id);
                return (
                  <div 
                    key={gw.id} 
                    onClick={() => setMethod(gw.id)} 
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-slate-800 bg-slate-50 shadow-sm' 
                        : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <PaymentGatewayLogo name={gw.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-[11px] truncate ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                        {gw.name}
                      </p>
                      <p className="text-[9px] text-slate-400 truncate mt-0.5">
                        Min {formatCurrency(gw.minAmount || siteSettings?.minDeposit || 10)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Amount */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[8px]">2</span>
              Deposit Amount
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm select-none">
                {currencySymbol}
              </span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-7 pr-3 text-sm font-black text-slate-800 outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition-shadow"
                required
                min={selectedGateway?.minAmount || siteSettings?.minDeposit || 10}
                placeholder="0"
              />
            </div>

            <div className="flex justify-between items-center px-1">
              <span className="text-[9px] font-semibold text-slate-500">Min: {formatCurrency(selectedGateway?.minAmount || siteSettings?.minDeposit || 10)}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q.toString())}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-colors ${
                    amount === q.toString() 
                      ? 'bg-slate-800 text-white border-slate-800' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  +{formatCurrency(q)}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Account Info & Instructions */}
          {selectedGateway && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <PaymentGatewayLogo name={selectedGateway.name} size="sm" />
                  <span className="font-bold text-[11px] text-slate-800">
                    Official Account
                  </span>
                </div>
                <span className="text-[9px] font-bold bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                  {gatewayInfo.type.split(' ')[0]}
                </span>
              </div>

              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg border border-slate-100 bg-slate-50">
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      {gatewayInfo.isCrypto ? 'Wallet Address' : 'Account Number'}
                    </p>
                    <p className="font-mono font-bold text-xs text-slate-800 tracking-wider mt-0.5 select-all truncate">
                      {gatewayInfo.number}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(gatewayInfo.number, 'acc_num')}
                    className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${
                      copiedKey === 'acc_num' 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {copiedKey === 'acc_num' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 p-2 rounded-lg border border-slate-100 bg-slate-50">
                  <div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Amount to Send</p>
                    <p className="font-bold text-xs text-slate-800">{formatCurrency(amount || '0')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(amount || '0', 'acc_amount')}
                    className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${
                      copiedKey === 'acc_amount' 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {copiedKey === 'acc_amount' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="pt-1">
                  <p className="text-[9px] font-bold text-slate-600 uppercase flex items-center gap-1 mb-1">
                    <Info className="w-3 h-3 text-blue-500" /> Instructions
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed whitespace-pre-wrap">
                    {selectedGateway.instructions || selectedGateway.details || (
                      gatewayInfo.isCrypto
                        ? `1. Open your crypto app.\n2. Send exact amount to the address above.\n3. Copy the TxID and paste below.`
                        : `1. আপনার ${selectedGateway.name} অ্যাপ ওপেন করুন\n2. ${gatewayInfo.type.split(' ')[0] === 'Agent' ? 'Cash Out' : 'Send Money'} অপশনে যান\n3. সঠিক পরিমাণ টাকা সেন্ড করে TrxID নিচে দিন।`
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Verification */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2.5">
            <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[8px]">3</span>
              Verify Payment
            </label>

            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                TrxID <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                value={txId}
                onChange={(e) => setTxId(e.target.value.toUpperCase())}
                placeholder="Transaction ID"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 text-[11px] font-mono font-bold text-slate-800 outline-none focus:ring-1 focus:ring-slate-400 transition-shadow uppercase"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Sender A/C
                </label>
                <input 
                  type="text" 
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="Account you sent from"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 text-[11px] text-slate-800 outline-none focus:ring-1 focus:ring-slate-400 transition-shadow"
                />
              </div>
              
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Screenshot
                </label>
                <label className="flex items-center justify-center w-full py-1.5 px-2 bg-slate-50 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors h-[30px]">
                  <span className="text-[9px] text-slate-500 font-medium truncate flex items-center gap-1">
                    <UploadCloud className="w-3 h-3" />
                    {proofFile ? proofFile.name : 'Upload file'}
                  </span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || !amount || !txId.trim()}
            className="w-full bg-slate-900 text-white font-bold py-3 text-[11px] rounded-xl hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Deposit ({formatCurrency(amount || '0')})</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Success Modal (Compact) */}
      {successModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-xl text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-800">Deposit Sent!</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                <span className="font-bold text-slate-700">{formatCurrency(amount)}</span> via {selectedGateway?.name}
              </p>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-left text-[10px] font-mono space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>TrxID:</span>
                <span className="font-bold text-slate-700 truncate max-w-[120px]">{txId}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Status:</span>
                <span className="font-bold text-amber-600">Reviewing</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/wallet')}
              className="w-full bg-slate-900 text-white font-bold py-2 rounded-lg hover:bg-slate-800 transition-colors text-[10px]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
