import { useState } from 'react';
import { ChevronDown, HelpCircle, X } from 'lucide-react';
import { cn, useCooldownHidden } from '../lib/utils';

const faqs = [
  {
    q: "How do I start earning?",
    a: "First, purchase an active plan to unlock micro tasks. Complete daily tasks up to your plan's earning limit to earn real money directly into your wallet."
  },
  {
    q: "How do withdrawals work?",
    a: "Navigate to your Wallet, select Withdraw, and choose your preferred payment gateway. Withdrawals are processed securely once your minimum balance is reached."
  },
  {
    q: "What is the Daily Reward?",
    a: "A free daily bonus for active users. Claim it every day from your Wallet to build your streak, which increases your bonus amount!"
  },
  {
    q: "How do referrals work?",
    a: "Share your unique referral link to invite friends. You'll earn a bonus when they sign up or deposit, plus a percentage of their earnings."
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isHidden, hideFaq] = useCooldownHidden('hide_home_faq', 12);

  if (isHidden) return null;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
      <button 
        onClick={() => hideFaq()}
        className="absolute top-2 right-2 p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
        aria-label="Close FAQ"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-1.5 mb-3">
        <HelpCircle className="w-4 h-4 text-indigo-500" />
        <h3 className="font-bold text-slate-800 text-sm pr-6">Quick Help & FAQ</h3>
      </div>
      <div className="space-y-2">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border border-slate-100 rounded-lg overflow-hidden bg-slate-50">
            <button 
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-2.5 text-left transition-colors hover:bg-slate-100"
            >
              <span className="text-xs font-bold text-slate-700">{faq.q}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", openIndex === idx && "rotate-180")} />
            </button>
            {openIndex === idx && (
              <div className="p-2.5 pt-1 text-[11px] text-slate-600 leading-relaxed border-t border-slate-100/50 bg-white">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
