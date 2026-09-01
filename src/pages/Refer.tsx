import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useCurrency } from '../hooks/useCurrency';
import { 
  Users, 
  TrendingUp, 
  Share2, 
  Copy, 
  Check, 
  Gift, 
  Trophy, 
  Activity, 
  Percent, 
  UserCheck, 
  Calendar, 
  ShieldCheck, 
  Sparkles,
  ArrowUpRight,
  Clock,
  ExternalLink,
  MessageCircle,
  Send
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Refer() {
  const { currentUser, referralSettings, users, plans, transactions } = useApp();
  const { formatCurrency } = useCurrency();

  if (!currentUser) return null;

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'history'>('info');
  const [searchMember, setSearchMember] = useState('');

  const referrerBonus = Number(referralSettings.referrerBonusAmount ?? referralSettings.signupBonusAmount ?? 2.50);
  const newUserBonus = Number(referralSettings.newUserBonusAmount ?? 1.00);

  // Calculate real referrals for this user
  const referredUsers = useMemo(() => {
    return users.filter(u => u.referredBy === currentUser.referralCode);
  }, [users, currentUser.referralCode]);

  const totalReferralsCount = referredUsers.length;
  const totalEarnedAmount = currentUser.referralEarnings || 0;

  // Filtered referred members
  const filteredMembers = useMemo(() => {
    if (!searchMember.trim()) return referredUsers;
    const q = searchMember.toLowerCase();
    return referredUsers.filter(u => 
      u.name.toLowerCase().includes(q) || 
      (u.email || '').toLowerCase().includes(q)
    );
  }, [referredUsers, searchMember]);

  // Referral Bonus History transactions
  const referralTransactions = useMemo(() => {
    return transactions
      .filter(t => t.userId === currentUser.id && t.type === 'referral_bonus' && t.status === 'approved')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentUser.id]);

  const currentPlanBonus = currentUser.activePlanId 
    ? (referralSettings.taskEarningBonusPercentByPlan[currentUser.activePlanId] || 0) 
    : 0;

  const currentPlan = plans.find(p => p.id === currentUser.activePlanId);

  // Dynamic share link
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const inviteLink = `${origin}/auth?ref=${currentUser.referralCode || ''}`;

  const handleCopyCode = () => {
    if (currentUser.referralCode) {
      navigator.clipboard.writeText(currentUser.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Earnify and earn daily rewards!',
          text: `Use my invite code ${currentUser.referralCode} to get an instant ${formatCurrency(newUserBonus)} welcome bonus!`,
          url: inviteLink,
        });
      } catch (err) {
        // Share cancelled or not supported
      }
    } else {
      handleCopyLink();
    }
  };

  const shareText = encodeURIComponent(`Sign up on Earnify using my invite link and get an instant ${formatCurrency(newUserBonus)} welcome bonus! ${inviteLink}`);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(`Get instant ${formatCurrency(newUserBonus)} welcome bonus on Earnify!`)}`;

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-10">
      {/* Referral Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-900 p-5 rounded-2xl shadow-sm relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-indigo-400/20 rounded-full blur-2xl -ml-8 -mb-8"></div>
        
        <div className="relative z-10 text-center">
          <div className="inline-flex p-2.5 rounded-2xl bg-white/10 backdrop-blur-md mb-2 border border-white/20">
            <Gift className="w-6 h-6 text-amber-300 animate-bounce" />
          </div>
          <h1 className="text-xl font-black mb-1 tracking-tight">Invite Friends & Earn Together</h1>
          <p className="text-indigo-100 text-xs mb-3.5 max-w-[320px] mx-auto leading-relaxed">
            You earn <strong className="text-white bg-indigo-500/80 px-1.5 py-0.5 rounded font-bold">{formatCurrency(referrerBonus)}</strong> per signup, plus your friend receives an instant <strong className="text-white bg-indigo-500/80 px-1.5 py-0.5 rounded font-bold">{formatCurrency(newUserBonus)}</strong> gift!
          </p>
          
          {/* Referral Code Box */}
          <div className="bg-white/15 backdrop-blur-md p-1.5 rounded-xl flex items-center border border-white/25 mx-auto max-w-[290px] shadow-sm">
            <div className="flex-1 px-3 font-mono font-black tracking-widest text-lg text-amber-300 text-center select-all">
              {currentUser.referralCode || 'N/A'}
            </div>
            <button 
              onClick={handleCopyCode}
              className="p-2.5 bg-white text-indigo-700 rounded-lg font-bold text-xs flex items-center gap-1 hover:bg-amber-50 active:scale-95 transition-all shadow-xs cursor-pointer"
              title="Copy referral code"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Action Share Buttons */}
          <div className="flex items-center justify-center gap-2 mt-3.5 flex-wrap">
            <button 
              onClick={handleCopyLink}
              className="py-2 px-4 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-all border border-white/30 inline-flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />} 
              {copiedLink ? 'Link Copied!' : 'Copy Referral Link'}
            </button>

            <button
              onClick={handleNativeShare}
              className="p-2 bg-white text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all border border-white/40 inline-flex items-center justify-center active:scale-95 cursor-pointer shadow-xs"
              title="Share via device"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all border border-emerald-400/50 inline-flex items-center justify-center active:scale-95 shadow-xs"
              title="Share on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </a>

            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all border border-sky-400/50 inline-flex items-center justify-center active:scale-95 shadow-xs"
              title="Share on Telegram"
            >
              <Send className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 2-Col Main Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-lg font-black text-slate-900 block leading-tight">{totalReferralsCount}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Referrals</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-lg font-black text-emerald-600 block leading-tight truncate">{formatCurrency(totalEarnedAmount)}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Referral Earnings</span>
          </div>
        </div>
      </div>

      {/* Navigation Navigation Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'info' 
              ? 'bg-white text-indigo-600 shadow-2xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Rewards Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'members' 
              ? 'bg-white text-indigo-600 shadow-2xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>My Network ({totalReferralsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'history' 
              ? 'bg-white text-indigo-600 shadow-2xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Bonus History</span>
        </button>
      </div>

      {/* Tab 1: Reward Rules & Commissions */}
      {activeTab === 'info' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h2 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <Trophy className="w-4 h-4 text-indigo-600" /> Multi-Tier Referral Program
            </h2>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
              Active Tier 1
            </span>
          </div>

          <div className="space-y-3.5">
            {/* Rule 1: Referrer signup */}
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 mt-0.5">
                <Gift className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800">1. Instant Referral Bonus</h3>
                  <span className="text-xs font-black text-indigo-600">{formatCurrency(referrerBonus)}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  You automatically receive <strong>{formatCurrency(referrerBonus)}</strong> credited to your balance when a friend signs up with your code.
                </p>
              </div>
            </div>

            {/* Rule 2: Friend welcome gift */}
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 mt-0.5">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800">2. Friend Welcome Gift</h3>
                  <span className="text-xs font-black text-emerald-600">{formatCurrency(newUserBonus)}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Your invited friend immediately receives <strong>{formatCurrency(newUserBonus)}</strong> welcome bonus in their wallet upon registration.
                </p>
              </div>
            </div>

            {/* Rule 3: Deposit Commission */}
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100 mt-0.5">
                <Percent className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800">3. Deposit Commission</h3>
                  <span className="text-xs font-black text-green-600">{referralSettings.depositBonusPercent}%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Earn a perpetual <strong>{referralSettings.depositBonusPercent}%</strong> instant commission every time your referred friend adds funds to their wallet.
                </p>
              </div>
            </div>

            {/* Rule 4: Task Commission by Plan */}
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 mt-0.5">
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800">4. Task Earnings Commission</h3>
                  <span className="text-xs font-black text-amber-600">{currentPlanBonus}%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Earn commissions whenever your referrals complete micro-tasks based on your active plan tier.
                </p>
                <div className="mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-600 block">Your Current Plan:</span>
                    <span className="text-xs font-black text-slate-800">{currentPlan?.name || 'Free Tier (0%)'}</span>
                  </div>
                  {!currentUser.activePlanId ? (
                    <Link
                      to="/plan"
                      className="px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1"
                    >
                      Upgrade Plan <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      {currentPlanBonus}% Rate Active
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Referred Members List */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" /> Referred Users ({referredUsers.length})
            </h2>
            {referredUsers.length > 0 && (
              <input
                type="text"
                placeholder="Search member..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] outline-none focus:ring-1 focus:ring-indigo-500 w-36"
              />
            )}
          </div>

          {filteredMembers.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">No invited members yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-[240px] mx-auto">
                  Share your referral link with friends on WhatsApp or social media to start earning commissions!
                </p>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Invite Link
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
              {filteredMembers.map((member) => (
                <div key={member.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name)}`} 
                      alt={member.name}
                      className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 shrink-0" 
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{member.name}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" /> Joined {member.joined || 'Recently'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 inline-block">
                      {member.status || 'Active'}
                    </span>
                    {member.activePlanId && (
                      <span className="text-[9px] font-medium text-slate-400 block mt-0.5">
                        Plan: {plans.find(p => p.id === member.activePlanId)?.name || 'Pro'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Bonus Earnings History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-600" /> Referral Earnings Ledger
            </h2>
            <span className="text-[10px] font-bold text-indigo-600">
              Total: {formatCurrency(totalEarnedAmount)}
            </span>
          </div>

          {referralTransactions.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Activity className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-800">No referral transactions yet</p>
              <p className="text-[10px] text-slate-400">Bonus credits from signups, deposits, and task completions will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
              {referralTransactions.map((tx) => (
                <div key={tx.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {tx.userDetails || 'Referral Reward'}
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" /> {tx.date}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-emerald-600 block">
                      +{formatCurrency(tx.amount)}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100 uppercase">
                      Approved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
