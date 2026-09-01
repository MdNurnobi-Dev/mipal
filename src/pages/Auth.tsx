import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useCurrency } from '../hooks/useCurrency';
import { Mail, Lock, User as UserIcon, Gift, CheckCircle2, AlertCircle, ArrowRight, LogOut, LayoutDashboard } from 'lucide-react';

interface AuthProps {
  defaultMode?: 'login' | 'signup';
}

export default function Auth({ defaultMode }: AuthProps) {
  const [searchParams] = useSearchParams();
  const routeParams = useParams<{ refCode?: string; referralCode?: string }>();
  
  // Detect referral code from multiple potential sources
  const refFromParam = routeParams.refCode || routeParams.referralCode || '';
  const refFromQuery = searchParams.get('ref') || 
                       searchParams.get('referral') || 
                       searchParams.get('referralCode') || 
                       searchParams.get('code') || 
                       searchParams.get('invite') || '';
  
  const initialReferralCode = (refFromParam || refFromQuery || '').trim();
  const shouldDefaultToSignup = Boolean(defaultMode === 'signup' || initialReferralCode);

  const [isLogin, setIsLogin] = useState(!shouldDefaultToSignup);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState(initialReferralCode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const navigate = useNavigate();
  const { currentUser, siteSettings, registerUser, referralSettings, loginUser, logout } = useApp();
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    if (initialReferralCode) {
      setReferralCode(initialReferralCode);
      setIsLogin(false);
    }
  }, [initialReferralCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (!isLogin) {
        if (!name.trim() || !email.trim()) {
          setMessage({ text: 'Please fill in all required fields.', type: 'error' });
          setIsSubmitting(false);
          return;
        }

        if (!password.trim() || password.length < 4) {
          setMessage({ text: "Password must be at least 4 characters.", type: "error" });
          setIsSubmitting(false);
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
          setIsSubmitting(false);
          return;
        }

        setMessage({ text: res.message || 'Account created successfully!', type: 'success' });
        
        // Auto-login after successful registration
        setTimeout(() => {
          loginUser(email, password).then((loginRes) => {
            if (loginRes.success) {
              navigate('/');
            } else {
              setIsLogin(true);
              setIsSubmitting(false);
            }
          });
        }, 500);
      } else {
        const res = await loginUser(email, password);
        if (res.success) {
          setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
          setTimeout(() => navigate('/'), 600);
        } else {
          setMessage({ text: res.message || 'Invalid email or password', type: 'error' });
          setIsSubmitting(false);
        }
      }
    } catch (err: any) {
      setMessage({ text: err?.message || 'An unexpected error occurred. Please try again.', type: 'error' });
      setIsSubmitting(false);
    }
  };

  const newUserBonus = referralSettings.newUserBonusAmount ?? 1.00;

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-center px-4 max-w-md mx-auto py-8">
      {/* Brand Header */}
      <div className="text-center mb-6">
        {siteSettings.logoUrl ? (
          <img src={siteSettings.logoUrl} alt={siteSettings.siteName} className="h-12 mx-auto mb-3 object-contain" />
        ) : (
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-200">
            <span className="text-white text-xl font-black">{siteSettings.siteName.charAt(0)}</span>
          </div>
        )}
        <h1 className="text-xl font-bold text-slate-800">{siteSettings.siteName}</h1>
        <p className="text-slate-500 mt-1 text-xs">{siteSettings.siteDescription}</p>
      </div>

      {/* Already Logged In Banner */}
      {currentUser && (
        <div className="mb-4 bg-white border border-indigo-200 rounded-2xl p-4 shadow-sm text-center">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2 font-bold">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <h3 className="font-bold text-slate-800 text-sm">You are logged in as {currentUser.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Link
              to="/"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Go to Dashboard</span>
            </Link>
            <button
              onClick={() => logout()}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Auth Card */}
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
            <span>{message.text}</span>
          </div>
        )}

        {!isLogin && referralCode && (
          <div className="mb-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold flex items-center gap-1">
                <span>Referral Code Applied:</span>
                <span className="font-mono bg-white px-1.5 py-0.5 rounded text-indigo-700 border border-indigo-200">{referralCode}</span>
              </div>
              <p className="text-[11px] text-indigo-700/80 mt-0.5">
                You will receive a <strong>{formatCurrency(newUserBonus)} welcome bonus</strong> upon registration!
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-xs"
                required 
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-xs"
              required 
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-xs"
              required 
            />
          </div>

          {!isLogin && (
            <div className="relative">
              <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
              <input 
                type="text" 
                placeholder="Referral Code (Optional)" 
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="w-full bg-indigo-50/40 border border-indigo-100 rounded-xl py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono uppercase transition-all text-xs text-indigo-900"
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-70 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-indigo-200 mt-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
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
            className="text-indigo-600 font-bold hover:underline cursor-pointer"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}