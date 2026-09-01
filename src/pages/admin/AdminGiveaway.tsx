import React, { useState } from 'react';
import { Gift, CheckCircle2, UploadCloud, Trash2, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdminGiveaway() {
  const { giveawayBanners, addGiveawayBanner, deleteGiveawayBanner, toggleGiveawayBanner } = useApp();
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let scaleSize = 1;
        if (img.width > MAX_WIDTH) {
          scaleSize = MAX_WIDTH / img.width;
        }
        canvas.width = img.width * scaleSize;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Compress the image
        const compressed = canvas.toDataURL('image/jpeg', 0.6);
        addGiveawayBanner({ imageUrl: compressed, isActive: true });
        setIsUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const activeBanners = giveawayBanners.filter(b => b.isActive);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide for preview
  useState(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (activeBanners.length > 0 ? (prev + 1) % activeBanners.length : 0));
    }, 3000);
    return () => clearInterval(timer);
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Gift className="w-5 h-5 text-indigo-500" /> Giveaway Banners
        </h2>
        <p className="text-xs text-slate-500 mt-1">Upload and manage promotional offer banners shown on the user homepage.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload & List */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm border-b border-slate-100 pb-4">
            <ImageIcon className="w-4 h-4 text-indigo-500" /> Upload New Banner
          </h3>
          
          <label className="flex flex-col items-center justify-center w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-8 h-8 mb-2 text-indigo-400" />
              <p className="mb-1 text-sm text-slate-600"><span className="font-bold">Click to upload</span> photo</p>
              <p className="text-xs text-slate-400">Target offer images (Max 800px wide)</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </label>
          
          {isUploading && <p className="text-xs text-indigo-600 text-center font-bold animate-pulse">Uploading and compressing image...</p>}

          <div className="pt-4 space-y-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm mb-2">Uploaded Banners</h3>
            {giveawayBanners.map(banner => (
              <div key={banner.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <img src={banner.imageUrl} alt="Banner" className="w-16 h-10 object-cover rounded shadow-sm bg-slate-200" />
                <div className="flex-1 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={banner.isActive} 
                        onChange={() => toggleGiveawayBanner(banner.id)}
                        className="sr-only peer" 
                      />
                      <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-500"></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{banner.isActive ? 'Active' : 'Hidden'}</span>
                  </label>
                  
                  <button 
                    onClick={() => deleteGiveawayBanner(banner.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {giveawayBanners.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-4">No banners uploaded yet.</p>
            )}
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-500" /> Live App Preview
          </h3>
          <p className="text-[11px] text-slate-500 mb-2">Users will see this sliding banner on their dashboard.</p>
          
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col justify-center items-center h-auto min-h-[250px]">
            {activeBanners.length > 0 ? (
              <div className="w-full max-w-[400px]">
                {/* Simulated Home Banner Carousel */}
                <div className="w-full overflow-hidden rounded-xl relative h-32 shadow-sm bg-slate-200">
                  <div 
                    className="flex transition-transform duration-700 ease-in-out h-full w-full"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {activeBanners.map(banner => (
                      <div key={banner.id} className="w-full h-full shrink-0 relative">
                        <img src={banner.imageUrl} alt="Giveaway Offer" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  {/* Indicators */}
                  {activeBanners.length > 1 && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
                      {activeBanners.map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-slate-400 flex flex-col items-center gap-2">
                <Gift className="w-8 h-8 opacity-20" />
                <p className="text-xs font-bold">No active banners to display.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
