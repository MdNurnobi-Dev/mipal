import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useCurrency } from '../hooks/useCurrency';
import { Mail, Lock, User as UserIcon, Gift, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const refFromUrl = searchParams.get('ref') || '';
  
  const [isLogin, setIsLogin] = useState(!refFromUrl);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState(refFromUrl);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const navigate = useNavigate();
  const { siteSettings, registerUser, referralSettings, loginUser } = useApp();
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    if (refFromUrl) {
      setReferralCode(refFromUrl);
      setIsLogin(false);
    }
  }, [refFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!isLogin) {
      if (!name.trim() || !email.trim()) {
        setMessage({ text: 'Please fill in all required fields.', type: 'error' });
        return;
      }

      if (!password.trim()) {
        setMessage({ text: "Password is required.", type: "error" });
        return;
      }
      const res = await registerUser({
        password: password,

        name: name.trim(),
        email: email.trim(),
        referralCode: referralCode.trim() || undefined
      });

      if (!res.success) {
        setMessage({ text: res.message, type: 'error' });
        return;
      }

      setMessage({ text: res.message, type: 'success' });
      setTimeout(() => {
        loginUser(email, password).then(() => {
          setTimeout(() => {
            navigate('/');
          }, 600);
        });
      }, 600);
    } else {
      loginUser(email, password).then(res => {
        if (res.success) {
          setMessage({ text: 'Login successful', type: 'success' });
          setTimeout(() => navigate('/'), 1200);
        } else {
          setMessage({ text: res.message || 'Login failed', type: 'error' });
        }
      });
    }
  };

  const newUserBonus = referralSettings.newUserBonusAmount ?? 1.00;

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-center px-4 max-w-md mx-auto py-8">
      <div className="text-center mb-6">
        {siteSettings.logoUrl ? (
          <img src={siteSettings.logoUrl} alt={siteSettings.siteName} className="h-12 mx-auto mb-3 object-contain" />
        ) : (
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-200">
            <span className="text-white text-xl font-black">{siteSettings.siteName.charAt(0)}</span>
          </div>
        )}
        <h1 className="text-xl font-bold text-slate-800">{siteSettings.siteName}</h1>
        <p className="text-slate-500 mt-1 text-[11px]">{siteSettings.siteDescription}</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4 text-center">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {message && (
          <div className={`p-3 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            {message.text}
          </div>
        )}

        {!isLogin && referralCode && (
          <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-800 flex items-center gap-2">
            <Gift className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Referral Code Active! You will receive a <strong>{formatCurrency(newUserBonus)} welcome bonus</strong> upon signing up.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <div className="relative">
              <UserIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-8 pr-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs"
                required 
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-8 pr-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs"
              required 
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-8 pr-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs"
              required 
            />
          </div>

          {!isLogin && (
            <div className="relative">
              <Gift className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
              <input 
                type="text" 
                placeholder="Referral Code (Optional)" 
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full bg-indigo-50/50 border border-indigo-100 rounded-lg py-2.5 pl-8 pr-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs"
              />
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 mt-2 text-sm cursor-pointer"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-5 text-center text-xs">
          <span className="text-slate-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage(null);
            }}
            className="text-indigo-600 font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}