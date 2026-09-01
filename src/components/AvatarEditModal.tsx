import React, { useState, useRef } from 'react';
import { X, Upload, Sparkles, Link as LinkIcon, Check, RotateCcw, Image as ImageIcon, Camera, Trash2, AlertCircle } from 'lucide-react';

interface AvatarEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  userName: string;
  onSaveAvatar: (newAvatarUrl: string) => void;
}

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Victor&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Felix&backgroundColor=b6e3f4,c0aede,d1d4f9',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Luna&backgroundColor=ffd5dc,ffdfbf,c0aede',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Jack&backgroundColor=b6e3f4,d1d4f9',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Emma&backgroundColor=ffd5dc,ffdfbf',
  'https://api.dicebear.com/7.x/bottts/svg?seed=CryptoKing&backgroundColor=b6e3f4,c0aede',
  'https://api.dicebear.com/7.x/bottts/svg?seed=PixelMaster&backgroundColor=ffd5dc,d1d4f9',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=faces&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces&q=80'
];

export default function AvatarEditModal({
  isOpen,
  onClose,
  currentAvatar,
  userName,
  onSaveAvatar
}: AvatarEditModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    currentAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName || 'User'}`
  );
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSelectedAvatar(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput.trim());
      setSelectedAvatar(urlInput.trim());
      setUrlError(false);
    } catch {
      setUrlError(true);
    }
  };

  const handleGenerateRandom = () => {
    const randomSeed = Math.random().toString(36).substring(2, 8);
    const styles = ['avataaars', 'lorelei', 'notionists', 'bottts'];
    const style = styles[Math.floor(Math.random() * styles.length)];
    const newAvatar = `https://api.dicebear.com/7.x/${style}/svg?seed=${randomSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    setSelectedAvatar(newAvatar);
  };

  const handleResetToDefault = () => {
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName || 'User'}`;
    setSelectedAvatar(defaultAvatar);
  };

  const handleSave = () => {
    onSaveAvatar(selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Update Profile Photo</h3>
              <p className="text-[11px] text-slate-500">Change your public avatar or upload your photo</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 no-scrollbar">
          {/* Avatar Preview Section */}
          <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-indigo-50/50 to-slate-50 rounded-2xl border border-indigo-100/60 relative">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-white ring-2 ring-indigo-500/20">
                <img 
                  src={selectedAvatar} 
                  alt="Avatar Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName || 'User'}`;
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Selected">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button 
                type="button"
                onClick={handleGenerateRandom}
                className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 hover:bg-indigo-50 transition-colors shadow-2xs"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" /> Randomize
              </button>
              <button 
                type="button"
                onClick={handleResetToDefault}
                className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[11px] font-semibold flex items-center gap-1 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" /> Reset Default
              </button>
            </div>
          </div>

          {/* Selection Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'upload' 
                  ? 'bg-white text-indigo-600 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Upload File
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preset')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'preset' 
                  ? 'bg-white text-indigo-600 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" /> Avatars
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'url' 
                  ? 'bg-white text-indigo-600 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" /> Image Link
            </button>
          </div>

          {/* Tab 1: Upload File */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                accept="image/*" 
                className="hidden" 
              />
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-indigo-500 bg-indigo-50/50' 
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700">Click to choose image or drag & drop</p>
                <p className="text-[10px] text-slate-400 mt-1">Supports JPG, PNG, WEBP, GIF (Max: 5MB)</p>
              </div>
            </div>
          )}

          {/* Tab 2: Preset Avatars */}
          {activeTab === 'preset' && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-medium text-slate-500">Select an avatar style:</p>
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5 max-h-52 overflow-y-auto p-1 no-scrollbar">
                {PRESET_AVATARS.map((avatarUrl, idx) => {
                  const isSelected = selectedAvatar === avatarUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(avatarUrl)}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all p-1 bg-slate-50 hover:scale-105 ${
                        isSelected 
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 shadow-xs' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img 
                        src={avatarUrl} 
                        alt={`Avatar preset ${idx + 1}`} 
                        className="w-full h-full object-cover rounded-lg"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-indigo-600 text-white p-0.5 rounded-full shadow-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: URL Input */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Direct Image URL</label>
                <div className="flex gap-2">
                  <input 
                    type="url"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setUrlError(false);
                    }}
                    placeholder="https://example.com/avatar.jpg"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shrink-0"
                  >
                    Apply
                  </button>
                </div>
                {urlError && (
                  <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Please enter a valid URL
                  </p>
                )}
                <p className="text-[10px] text-slate-400 mt-1.5">Paste a direct image link from Imgur, Cloudinary, Unsplash, etc.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Save Avatar
          </button>
        </div>
      </div>
    </div>
  );
}
