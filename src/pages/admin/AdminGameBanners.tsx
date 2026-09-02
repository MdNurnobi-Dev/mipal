import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Save, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdminGameBanners() {
  const { siteSettings, updateSiteSettings } = useApp();
  const [success, setSuccess] = useState('');
  
  const [banners, setBanners] = useState<{id: string, url: string}[]>([]);
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    if (siteSettings?.gameBanners) {
      setBanners(siteSettings.gameBanners);
    }
  }, [siteSettings]);

  const handleAddBanner = () => {
    if (!newUrl) return;
    setBanners(prev => [...prev, { id: Date.now().toString(), url: newUrl }]);
    setNewUrl('');
  };

  const handleRemoveBanner = (id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  const handleSave = async () => {
    await updateSiteSettings({ gameBanners: banners });
    setSuccess('Game banners updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
          <ImageIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Game Banners</h1>
          <p className="text-slate-500 text-sm">Manage banners for the games lobby</p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-lg flex items-center gap-2 mb-6 border border-emerald-100">
          <CheckCircle className="w-5 h-5" />
          <p className="font-medium">{success}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-indigo-500" />
          <h2 className="font-bold text-slate-800">Lobby Banners (Slideshow)</h2>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Banner Image URL..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddBanner}
              className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg font-medium hover:bg-indigo-200 transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Banner
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {banners.map((banner) => (
              <div key={banner.id} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                <img src={banner.url} alt="Game Banner" className="w-full h-full object-cover" />
                <button
                  onClick={() => handleRemoveBanner(banner.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {banners.length === 0 && (
              <div className="col-span-full py-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                No banners added yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Banners
        </button>
      </div>
    </div>
  );
}
