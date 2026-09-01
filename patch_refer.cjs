const fs = require('fs');
const content = `import React, { useState, useMemo } from 'react';
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

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'history'>('info');
  const [searchMember, setSearchMember] = useState('');

  const referrerBonus = Number(referralSettings.referrerBonusAmount ?? referralSettings.signupBonusAmount ?? 2.50);
  const newUserBonus = Number(referralSettings.newUserBonusAmount ?? 1.00);

  // Calculate real referrals for this user
  const referredUsers = useMemo(() => {
    return users.filter(u => u.referredBy === currentUser?.referralCode);
  }, [users, currentUser?.referralCode]);

  const totalReferralsCount = referredUsers.length;
  const totalEarnedAmount = currentUser?.referralEarnings || 0;

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
      .filter(t => t.userId === currentUser?.id && t.type === 'referral_bonus' && t.status === 'approved')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentUser?.id]);

  const currentPlanBonus = currentUser?.activePlanId 
    ? (referralSettings.taskEarningBonusPercentByPlan[currentUser?.activePlanId] || 0) 
    : 0;
  const currentPlan = plans.find(p => p.id === currentUser?.activePlanId);

  // Dynamic share link
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const inviteLink = \`\${origin}/auth?ref=\${currentUser?.referralCode || ''}\`;

  const handleCopyCode = () => {
    if (currentUser?.referralCode) {
      navigator.clipboard.writeText(currentUser?.referralCode);
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
          title: 'Join miPall and earn daily rewards!',
          text: \`Use my invite code \${currentUser?.referralCode} to get an instant \${formatCurrency(newUserBonus)} welcome bonus!\`,
          url: inviteLink,
        });
      } catch (err) {
        // Share cancelled or not supported
      }
    } else {
      handleCopyLink();
    }
  };

  const shareText = encodeURIComponent(\`Sign up on miPall using my invite link and get an instant \${formatCurrency(newUserBonus)} welcome bonus! \${inviteLink}\`);
  const whatsappUrl = \`https://api.whatsapp.com/send?text=\${shareText}\`;
  const telegramUrl = \`https://t.me/share/url?url=\${encodeURIComponent(inviteLink)}&text=\${encodeURIComponent(\`Get instant \${formatCurrency(newUserBonus)} welcome bonus on miPall!\`)}\`;

  if (!currentUser) return null;

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-10 font-sans">
      
      {/* Clean Compact Hero */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-2">
            <Gift className="w-5 h-5 text-indigo-600" />
          </div>
          <h1 className="text-sm font-black text-slate-800 tracking-tight mb-1">Invite & Earn Rewards</h1>
          <p className="text-[10px] text-slate-500 max-w-[260px] leading-relaxed mb-4">
            Earn <span className="font-bold text-slate-700">{formatCurrency(referrerBonus)}</span> per invite. Friends get <span className="font-bold text-slate-700">{formatCurrency(newUserBonus)}</span> welcome bonus!
          </p>
          
          {/* Code & Link Actions */}
          <div className="w-full bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-1.5 shadow-xs">
              <span className="text-xs font-mono font-bold text-slate-600 px-2 tracking-widest">{currentUser?.referralCode || 'N/A'}</span>
              <button 
                onClick={handleCopyCode}
                className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-bold transition-colors flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copiedCode ? 'Copied' : 'Copy Code'}
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleCopyLink}
                className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} 
                {copiedLink ? 'Link Copied!' : 'Copy Invite Link'}
              </button>
              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 flex items-center justify-center bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-lg transition-colors border border-sky-100"
                >
                  <Send className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={handleNativeShare}
                  className="w-7 h-7 flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Col Main Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-black text-slate-800 block leading-none mb-0.5">{totalReferralsCount}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Invited</span>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-black text-slate-800 block leading-none mb-0.5 truncate">{formatCurrency(totalEarnedAmount)}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Earned Bonus</span>
          </div>
        </div>
      </div>

      {/* Compact Tabs */}
      <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
        <button
          onClick={() => setActiveTab('info')}
          className={\`flex-1 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 \${
            activeTab === 'info' 
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' 
              : 'text-slate-500 hover:text-slate-700'
          }\`}
        >
          <Sparkles className="w-3 h-3" /> Guide
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={\`flex-1 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 \${
            activeTab === 'members' 
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' 
              : 'text-slate-500 hover:text-slate-700'
          }\`}
        >
          <Users className="w-3 h-3" /> Network
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={\`flex-1 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 \${
            activeTab === 'history' 
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' 
              : 'text-slate-500 hover:text-slate-700'
          }\`}
        >
          <Activity className="w-3 h-3" /> History
        </button>
      </div>

      {/* Tab 1: Reward Rules & Commissions */}
      {activeTab === 'info' && (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <Trophy className="w-3.5 h-3.5 text-indigo-600" /> Reward Rules
            </h2>
            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold border border-indigo-100 uppercase tracking-wide">
              Tier 1
            </span>
          </div>

          <div className="space-y-3">
            {/* Rule 1 */}
            <div className="flex gap-2.5 items-start">
              <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 mt-0.5">
                <Gift className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-[11px] font-bold text-slate-800">Signup Bonus</h3>
                  <span className="text-[11px] font-black text-indigo-600">{formatCurrency(referrerBonus)}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  You receive <span className="font-medium text-slate-700">{formatCurrency(referrerBonus)}</span> when a friend signs up.
                </p>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="flex gap-2.5 items-start">
              <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 mt-0.5">
                <UserCheck className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-[11px] font-bold text-slate-800">Friend Gift</h3>
                  <span className="text-[11px] font-black text-emerald-600">{formatCurrency(newUserBonus)}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  Your friend gets <span className="font-medium text-slate-700">{formatCurrency(newUserBonus)}</span> welcome bonus.
                </p>
              </div>
            </div>

            {/* Rule 3 */}
            <div className="flex gap-2.5 items-start">
              <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 mt-0.5">
                <Percent className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-[11px] font-bold text-slate-800">Deposit Comm.</h3>
                  <span className="text-[11px] font-black text-blue-600">{referralSettings.depositBonusPercent}%</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  Earn <span className="font-medium text-slate-700">{referralSettings.depositBonusPercent}%</span> every time they deposit funds.
                </p>
              </div>
            </div>

            {/* Rule 4 */}
            <div className="flex gap-2.5 items-start">
              <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 mt-0.5">
                <Activity className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-[11px] font-bold text-slate-800">Task Comm.</h3>
                  <span className="text-[11px] font-black text-amber-600">{currentPlanBonus}%</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  Earn commissions on tasks they complete.
                </p>
                <div className="mt-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="text-[9px] font-medium text-slate-500 block leading-tight">Your Plan:</span>
                    <span className="text-[10px] font-bold text-slate-700 truncate">{currentPlan?.name || 'Free Tier'}</span>
                  </div>
                  {!currentUser?.activePlanId ? (
                    <Link
                      to="/plan"
                      className="px-2 py-1 bg-indigo-600 text-white text-[9px] font-bold rounded-md hover:bg-indigo-700 transition-colors whitespace-nowrap"
                    >
                      Upgrade
                    </Link>
                  ) : (
                    <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 whitespace-nowrap">
                      {currentPlanBonus}% Active
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[320px]">
          <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
            <h2 className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" /> Network ({referredUsers.length})
            </h2>
            {referredUsers.length > 0 && (
              <input
                type="text"
                placeholder="Search..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="bg-white border border-slate-200 rounded-md px-2 py-1 text-[10px] outline-none focus:border-indigo-500 w-28 shadow-xs"
              />
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-700">No members yet</p>
                  <p className="text-[9px] text-slate-400 mt-0.5 max-w-[200px]">
                    Share your link to start building your network.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="p-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img 
                        src={member.avatar || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${encodeURIComponent(member.name)}\`} 
                        alt={member.name}
                        className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 shrink-0" 
                      />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-800 truncate leading-tight">{member.name}</p>
                        <p className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-2 h-2" /> {member.joined || 'Recently'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 inline-block">
                        {member.status || 'Active'}
                      </span>
                      {member.activePlanId && (
                        <span className="text-[8px] font-medium text-slate-400 block mt-0.5">
                          {plans.find(p => p.id === member.activePlanId)?.name || 'Pro'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Bonus Earnings History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[320px]">
          <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
            <h2 className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" /> History
            </h2>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
              +{formatCurrency(totalEarnedAmount)}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {referralTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-2">
                <Activity className="w-8 h-8 text-slate-200" />
                <p className="text-[11px] font-bold text-slate-500">No bonus history</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {referralTransactions.map((tx) => (
                  <div key={tx.id} className="p-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 truncate">
                        {tx.userDetails || 'Referral Reward'}
                      </p>
                      <p className="text-[9px] text-slate-400 mt-0.5">
                        {tx.date}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-black text-emerald-600 block leading-tight">
                        +{formatCurrency(tx.amount)}
                      </span>
                      <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1 py-px rounded border border-emerald-100 mt-0.5 inline-block uppercase tracking-wider">
                        Paid
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
`;
fs.writeFileSync('src/pages/Refer.tsx', content);
console.log('Refer.tsx patched');
