import React, { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, Link as LinkIcon, Phone, Mail, MessageCircle, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export default function AdminBranding() {
  const { updateSiteSettings } = useApp();
  const { siteSettings } = useSiteSettings();
  
  const [formData, setFormData] = useState({
    siteName: siteSettings.siteName || '',
    siteDescription: siteSettings.siteDescription || '',
    logoUrl: siteSettings.logoUrl || '',
    faviconUrl: siteSettings.faviconUrl || '',
    supportEmail: siteSettings.supportEmail || '',
    supportPhone: siteSettings.supportPhone || '',
    facebookUrl: siteSettings.facebookUrl || '',
    telegramUrl: siteSettings.telegramUrl || '',
    whatsappUrl: siteSettings.whatsappNumber || siteSettings.whatsappUrl || '',
    primaryColor: siteSettings.primaryColor || '#4f46e5'
  });

  const [isDirty, setIsDirty] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'saving' | 'success' | 'error'; message?: string }>({ type: 'idle' });

  useEffect(() => {
    if (!isDirty) {
      setFormData({
        siteName: siteSettings.siteName || '',
        siteDescription: siteSettings.siteDescription || '',
        logoUrl: siteSettings.logoUrl || '',
        faviconUrl: siteSettings.faviconUrl || '',
        supportEmail: siteSettings.supportEmail || '',
        supportPhone: siteSettings.supportPhone || '',
        facebookUrl: siteSettings.facebookUrl || '',
        telegramUrl: siteSettings.telegramUrl || '',
        whatsappUrl: siteSettings.whatsappNumber || siteSettings.whatsappUrl || '',
        primaryColor: siteSettings.primaryColor || '#4f46e5'
      });
    }
  }, [siteSettings, isDirty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'saving' });
    try {
      await updateSiteSettings({
        ...formData,
        whatsappNumber: formData.whatsappUrl
      });
      setIsDirty(false);
      setStatus({ type: 'success', message: 'Branding settings updated and propagated to database.' });
      setTimeout(() => setStatus(prev => prev.type === 'success' ? { type: 'idle' } : prev), 4000);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err?.message || 'Failed to update branding settings.' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsDirty(true);
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.type !== 'idle') setStatus({ type: 'idle' });
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Branding Settings</h1>
          <p className="text-slate-500 text-xs mt-1">Control your site's identity, logos, and contact information.</p>
        </div>
      </div>

      {status.type === 'success' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-start gap-3 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-xs">Branding Saved!</h4>
            <p className="text-[11px] text-emerald-700 mt-0.5">{status.message}</p>
          </div>
          <button onClick={() => setStatus({ type: 'idle' })} className="text-emerald-500 hover:text-emerald-800 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {status.type === 'error' && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-3 shadow-xs animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-xs">Save Failed</h4>
            <p className="text-[11px] text-rose-700 mt-0.5">{status.message}</p>
          </div>
          <button onClick={() => setStatus({ type: 'idle' })} className="text-rose-500 hover:text-rose-800 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Identity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <ImageIcon className="w-4 h-4 text-indigo-500" /> Site Identity & Logos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Site Name</label>
              <input 
                type="text"
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                placeholder="e.g. My Awesome Site"
                required
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Primary Color (Hex)</label>
              <div className="flex gap-2">
                <input 
                  type="color"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  className="h-9 w-9 rounded border border-slate-200 p-0.5 cursor-pointer"
                />
                <input 
                  type="text"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 font-mono"
                  placeholder="#4f46e5"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Site Description (SEO)</label>
              <textarea 
                name="siteDescription"
                value={formData.siteDescription}
                onChange={handleChange}
                rows={2}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                placeholder="A short description of what your site does..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Logo URL</label>
              <input 
                type="url"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                placeholder="https://example.com/logo.png"
              />
              <p className="text-[9px] text-slate-400 mt-1">Leave empty to use Site Name as text logo.</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Favicon URL</label>
              <input 
                type="url"
                name="faviconUrl"
                value={formData.faviconUrl}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                placeholder="https://example.com/favicon.ico"
              />
              <p className="text-[9px] text-slate-400 mt-1">Appears in browser tabs.</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Mail className="w-4 h-4 text-indigo-500" /> Support & Contact
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Mail className="w-3 h-3"/> Support Email</label>
              <input 
                type="email"
                name="supportEmail"
                value={formData.supportEmail}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                placeholder="support@example.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Phone className="w-3 h-3"/> Phone Number</label>
              <input 
                type="text"
                name="supportPhone"
                value={formData.supportPhone}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                placeholder="+1 234 567 890"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <LinkIcon className="w-4 h-4 text-indigo-500" /> Social Links
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Facebook Page URL</label>
              <input 
                type="url"
                name="facebookUrl"
                value={formData.facebookUrl}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Telegram Group/Channel URL</label>
              <input 
                type="url"
                name="telegramUrl"
                value={formData.telegramUrl}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                placeholder="https://t.me/..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><MessageCircle className="w-3 h-3"/> WhatsApp Number / Link</label>
              <input 
                type="text"
                name="whatsappUrl"
                value={formData.whatsappUrl}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                placeholder="https://wa.me/..."
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={status.type === 'saving'}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
        >
          {status.type === 'saving' ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Saving to Database...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Branding Settings
            </>
          )}
        </button>
      </form>
    </div>
  );
}
