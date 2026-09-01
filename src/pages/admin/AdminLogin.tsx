import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Shield, Mail, Lock } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { adminLogin } = useApp();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await adminLogin(email, password);
    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-slate-200">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Portal</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to manage MicroJob Pro</p>
        </div>
        
        {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="email" 
              placeholder="Admin Email" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-md mt-4"
          >
            Secure Login
          </button>
        </form>
      </div>
    </div>
  );
}
