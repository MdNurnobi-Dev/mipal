import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Wallet as WalletIcon, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowUpRight,
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

  const activeGateways = useMemo(() => gateways.filter(gw => gw.isActive), [gateways]);
  
  const [amount, setAmount] = useState('');
  const [selectedGwId, setSelectedGwId] = useState(activeGateways[0]?.id || '');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('Personal');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const balance = currentUser?.balance || 0;

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
        userId: currentUser?.id,
        userName: currentUser?.name,
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
            <h2 className="text-[13px] font-black text-slate-800">Withdraw Funds</h2>
            <p className="text-[10px] text-slate-500 font-medium">Transfer out to your account</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[9px] font-bold px-2 py-1 rounded-md shadow-sm">
          <ShieldCheck className="w-3 h-3" />
          <span>Fast</span>
        </div>
      </div>

      {/* Available Balance */}
      <div className="bg-slate-900 p-3.5 rounded-xl shadow-sm relative overflow-hidden flex items-center justify-between border border-slate-800">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-8 -mt-8"></div>
        <div className="relative z-10">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
            <WalletIcon className="w-3 h-3 text-slate-300" />
            Wallet Balance
          </p>
          <div className="text-xl font-black text-white tracking-tight">
            {formatCurrency(balance)}
          </div>
        </div>
        <button
          type="button"
          onClick={handleMax}
          className="relative z-10 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-white/10 shadow-sm"
        >
          MAX
        </button>
      </div>

      <form onSubmit={handleWithdraw} className="space-y-3">
        {/* Step 1: Payout Method */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[8px]">1</span>
              Payout Method
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {activeGateways.map((gw) => {
              const isSelected = selectedGateway?.id === gw.id;
              return (
                <div 
                  key={gw.id} 
                  onClick={() => setSelectedGwId(gw.id)}
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
                      Min {formatCurrency(gw.minAmount || minWithdraw)}
                    </p>
                  </div>
                </div>
              );
            })}
            {activeGateways.length === 0 && (
              <div className="col-span-2 text-center text-[10px] text-slate-400 py-2">
                No gateways configured.
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Withdrawal Amount */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[8px]">2</span>
            Withdraw Amount
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
              min={minWithdraw}
              max={balance}
              step="any"
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-between items-center px-1">
            <span className="text-[9px] font-semibold text-slate-500">Min: {formatCurrency(minWithdraw)}</span>
            <span className="text-[9px] font-semibold text-slate-500">Max: {formatCurrency(balance)}</span>
          </div>

          <div className="flex gap-1.5 pt-0.5">
            {quickPercentages.map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setAmount(((balance * pct) / 100).toFixed(2))}
                className="flex-1 py-1 rounded-md text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Account Details */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2.5">
          <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[8px]">3</span>
            Receiving Account
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAccountType('Personal')}
              className={`py-1.5 rounded-md text-[10px] font-bold border transition-colors ${
                accountType === 'Personal'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Personal
            </button>
            <button
              type="button"
              onClick={() => setAccountType('Agent')}
              className={`py-1.5 rounded-md text-[10px] font-bold border transition-colors ${
                accountType === 'Agent'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Agent / Merchant
            </button>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Account No / Wallet Address <span className="text-rose-500">*</span>
            </label>
            <input 
              type="text" 
              required
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              placeholder="e.g. 017XXXXXXXX or USDT TRC20"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 text-[11px] font-mono font-bold text-slate-800 outline-none focus:ring-1 focus:ring-slate-400 transition-shadow"
            />
          </div>

          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Notes (Optional)
            </label>
            <input 
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. urgent payout"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 text-[11px] text-slate-800 outline-none focus:ring-1 focus:ring-slate-400 transition-shadow"
            />
          </div>
        </div>

        {/* Submit */}
        <button 
          type="submit"
          disabled={isSubmitting || !amount || parseFloat(amount) > balance || parseFloat(amount) < minWithdraw}
          className="w-full bg-slate-900 text-white font-bold py-3 text-[11px] rounded-xl hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Submit Request ({formatCurrency(amount || '0')})</span>
            </>
          )}
        </button>
      </form>

      {/* Success Modal (Compact) */}
      {successModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-xl text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-800">Withdrawal Requested!</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                <span className="font-bold text-slate-700">{formatCurrency(amount)}</span> via {selectedGateway?.name}
              </p>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-left text-[10px] font-mono space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Account:</span>
                <span className="font-bold text-slate-700 truncate max-w-[120px]">{accountNumber}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Status:</span>
                <span className="font-bold text-amber-600">Pending Approval</span>
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
