import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Wallet as WalletIcon, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowUpRight,
  Info,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useCurrency } from '../hooks/useCurrency';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { PaymentGatewayLogo } from '../components/PaymentGatewayLogo';

export default function Withdraw() {
  const navigate = useNavigate();
  const { currentUser, addTransaction, gateways } = useApp();
  const { siteSettings } = useSiteSettings();
  const { currencySymbol, formatCurrency } = useCurrency();

  if (!currentUser) return null;
  const activeGateways = useMemo(() => gateways.filter(gw => gw.isActive), [gateways]);
  
  const [amount, setAmount] = useState('');
  const [selectedGwId, setSelectedGwId] = useState(activeGateways[0]?.id || '');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('Personal');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const balance = currentUser.balance;

  const selectedGateway = useMemo(() => {
    return activeGateways.find(g => g.id === selectedGwId) || activeGateways[0];
  }, [activeGateways, selectedGwId]);

  const minWithdraw = siteSettings?.minWithdraw || selectedGateway?.minAmount || 10;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      alert('Please enter a valid withdrawal amount.');
      return;
    }

    if (withdrawAmount > balance) {
      alert('Insufficient wallet balance!');
      return;
    }

    if (withdrawAmount < minWithdraw) {
      alert(`Minimum withdrawal limit is ${formatCurrency(minWithdraw)}`);
      return;
    }

    if (!accountNumber.trim()) {
      alert('Please provide your payout account number / wallet address.');
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      const detailsString = `${selectedGateway?.name || 'Manual'} (${accountType}) | Acc: ${accountNumber.trim()}${notes ? ` | Notes: ${notes.trim()}` : ''}`;
      
      addTransaction({
        userId: currentUser.id,
        userName: currentUser.name,
        type: 'withdraw',
        amount: withdrawAmount,
        method: selectedGateway?.name || 'Manual Transfer',
        userDetails: detailsString
      });
      
      setIsSubmitting(false);
      setSuccessModal(true);
    }, 600);
  };

  const handleMax = () => {
    setAmount(balance.toFixed(2));
  };

  const quickPercentages = [25, 50, 75, 100];

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
            <h2 className="text-base font-bold text-slate-800">Withdraw Funds</h2>
            <p className="text-[11px] text-slate-500">Transfer money to your personal account</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Fast Processing</span>
        </div>
      </div>

      {/* Available Balance Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4 rounded-2xl text-white shadow-md relative overflow-hidden flex items-center justify-between border border-white/10">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl"></div>
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <WalletIcon className="w-3.5 h-3.5 text-indigo-400" />
            Available Balance
          </p>
          <div className="text-2xl font-black text-emerald-400 tracking-tight">
            {formatCurrency(balance)}
          </div>
        </div>
        <button
          type="button"
          onClick={handleMax}
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer border border-white/10"
        >
          Withdraw All
        </button>
      </div>

      <form onSubmit={handleWithdraw} className="space-y-4">
        {/* Step 1: Payout Method */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px]">1</span>
              Select Payout Gateway
            </label>
            <span className="text-[10px] text-slate-400">Where to receive money</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeGateways.map((gw) => {
              const isSelected = selectedGateway?.id === gw.id;
              return (
                <div 
                  key={gw.id} 
                  onClick={() => setSelectedGwId(gw.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs' 
                      : 'border-slate-150 bg-white hover:bg-slate-50/80 hover:border-slate-300'
                  }`}
                >
                  <PaymentGatewayLogo name={gw.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <span className={`font-bold text-xs truncate block ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                      {gw.name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Min: {formatCurrency(gw.minAmount || minWithdraw)}
                    </span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-indigo-600' : 'border-slate-300'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                  </div>
                </div>
              );
            })}
            {activeGateways.length === 0 && (
              <div className="col-span-2 text-center text-xs text-slate-400 py-3">
                No custom payout gateways configured.
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Withdrawal Amount */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px]">2</span>
              Withdraw Amount
            </label>
            <span className="text-[10px] font-semibold text-slate-500">
              Min: {formatCurrency(minWithdraw)}
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
              min={minWithdraw}
              max={balance}
              step="any"
              placeholder="0.00"
            />
          </div>

          {/* Quick Percentages */}
          <div className="flex gap-2 pt-1">
            {quickPercentages.map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setAmount(((balance * pct) / 100).toFixed(2))}
                className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-slate-50 border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Account Details */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px]">3</span>
              Receiving Account Details
            </label>
            <span className="text-[10px] text-slate-400">Accurate info required</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAccountType('Personal')}
              className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                accountType === 'Personal'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Personal Account
            </button>
            <button
              type="button"
              onClick={() => setAccountType('Agent')}
              className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                accountType === 'Agent'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Agent / Merchant
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Account Number / Crypto Wallet Address <span className="text-rose-500">*</span>
            </label>
            <input 
              type="text" 
              required
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              placeholder="e.g. 017XXXXXXXX or USDT TRC20 Address"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Additional Notes (Optional)
            </label>
            <input 
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Emergency payout or alternative contact"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Submit Withdrawal Request */}
        <button 
          type="submit"
          disabled={isSubmitting || !amount || parseFloat(amount) > balance || parseFloat(amount) < minWithdraw}
          className="w-full bg-slate-900 text-white font-bold py-3.5 px-4 text-sm rounded-xl hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing Request...</span>
            </>
          ) : (
            <>
              <ArrowUpRight className="w-4 h-4" />
              <span>Submit Withdrawal Request ({formatCurrency(amount || '0')})</span>
            </>
          )}
        </button>
      </form>

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">Withdrawal Requested!</h3>
              <p className="text-xs text-slate-500">
                Your request to withdraw <span className="font-bold text-slate-800">{formatCurrency(amount)}</span> via {selectedGateway?.name} is submitted.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-500">
                <span>Account:</span>
                <span className="font-bold text-slate-800 truncate max-w-[180px]">{accountNumber}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Status:</span>
                <span className="font-bold text-amber-600">Pending Approval</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Funds will be sent to your account within 15-60 minutes after admin verification.
            </p>

            <button
              onClick={() => navigate('/wallet')}
              className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 transition-colors text-xs"
            >
              Back to Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
