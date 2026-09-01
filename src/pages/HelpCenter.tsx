import { useState } from 'react';
import { Search, HelpCircle, FileText, MessageCircle, Mail, Phone, ExternalLink } from 'lucide-react';
import FaqSection from '../components/FaqSection';

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="bg-indigo-600 p-5 rounded-xl text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-1">Help Center</h2>
          <p className="text-xs text-indigo-100 mb-4">How can we help you today?</p>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search for articles, guides..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <button className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-xs font-bold text-slate-700">Guides</span>
        </button>
        <button className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-xs font-bold text-slate-700">FAQ</span>
        </button>
      </div>

      {/* FAQ Section */}
      <FaqSection />

      {/* Contact Support */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-indigo-500" />
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Contact Support</h3>
        </div>
        <div className="divide-y divide-slate-100">
          <a href="mailto:support@microjob.com" className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <Mail className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">Email Us</p>
                <p className="text-[10px] text-slate-500">support@microjob.com</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>
          <a href="tel:+1234567890" className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <Phone className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">Call Center</p>
                <p className="text-[10px] text-slate-500">+1 (234) 567-890</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
}
