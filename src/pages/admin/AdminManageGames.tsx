import React, { useState, useEffect } from 'react';
import { Gamepad2, Save, CheckCircle, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ALL_GAMES = [
  { id: 'aviator', name: 'AVIATOR', provider: 'SPRIBE' },
  { id: 'super_ace', name: 'Super Ace', provider: 'JILI' },
  { id: 'fortune_gems', name: 'Fortune Gems', provider: 'JILI' },
  { id: 'mines', name: 'MINES', provider: 'STAKE' },
  { id: 'fly_x', name: 'FLY X', provider: 'MICROGAMING' },
  { id: 'spaceman', name: 'SPACEMAN', provider: 'PRAGMATIC PLAY' },
  { id: 'wild_bounty', name: 'Wild Bounty', provider: 'PG SOFT' }
];

export default function AdminManageGames() {
  const { siteSettings, updateSiteSettings } = useApp();
  const [success, setSuccess] = useState('');
  
  // gameStates will be a dictionary like { 'aviator': true, 'super_ace': false }
  const [gameStates, setGameStates] = useState<Record<string, boolean>>({});
  // gameWinControls: 'zero', 'low', 'medium', 'high'
  const [gameWinControls, setGameWinControls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (siteSettings?.gameStates) {
      setGameStates(siteSettings.gameStates);
    } else {
      // Default initial states if not set
      setGameStates({
        aviator: true,
        super_ace: true,
        fortune_gems: true,
        mines: true,
        fly_x: true,
        spaceman: false,
        wild_bounty: false
      });
    }

    if (siteSettings?.gameWinControls) {
      setGameWinControls(siteSettings.gameWinControls);
    } else {
      // Default win controls
      setGameWinControls({
        aviator: 'medium',
        super_ace: 'medium',
        fortune_gems: 'medium',
        mines: 'medium',
        fly_x: 'low',
        spaceman: 'medium',
        wild_bounty: 'medium'
      });
    }
  }, [siteSettings]);

  const toggleGame = (id: string) => {
    setGameStates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleWinControlChange = (id: string, level: string) => {
    setGameWinControls(prev => ({
      ...prev,
      [id]: level
    }));
  };

  const handleSave = async () => {
    await updateSiteSettings({ gameStates, gameWinControls });
    setSuccess('Game settings updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
          <Gamepad2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Games</h1>
          <p className="text-slate-500 text-sm">Enable/disable games and control win/loss rates</p>
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
          <Gamepad2 className="w-5 h-5 text-indigo-500" />
          <h2 className="font-bold text-slate-800">Game Availability & Win Control</h2>
        </div>
        
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Game</th>
                <th className="px-4 py-3 font-semibold">Provider</th>
                <th className="px-4 py-3 font-semibold text-center">Win Control</th>
                <th className="px-4 py-3 font-semibold text-right">Status (Enable/Disable)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ALL_GAMES.map(game => (
                <tr key={game.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-800">{game.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-slate-500">{game.provider}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                      {['zero', 'low', 'medium', 'high'].map(level => {
                        const isSelected = gameWinControls[game.id] === level;
                        const labels: Record<string, { name: string; rate: string }> = {
                          zero: { name: 'Zero', rate: '0% Win' },
                          low: { name: 'Low', rate: '8% Win (92% Loss)' },
                          medium: { name: 'Medium', rate: '18% Win' },
                          high: { name: 'High', rate: '45% Win' }
                        };
                        const colors: Record<string, string> = {
                          zero: 'text-rose-600 bg-white shadow-xs border border-rose-200 font-semibold',
                          low: 'text-orange-600 bg-white shadow-xs border border-orange-200 font-semibold',
                          medium: 'text-indigo-600 bg-white shadow-xs border border-indigo-200 font-semibold',
                          high: 'text-emerald-600 bg-white shadow-xs border border-emerald-200 font-semibold'
                        };
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => handleWinControlChange(game.id, level)}
                            title={`${labels[level].name}: ${labels[level].rate}`}
                            className={`px-2.5 py-1 text-[11px] rounded-md transition-all flex flex-col items-center leading-tight ${
                              isSelected ? colors[level] : 'text-slate-500 hover:text-slate-700 font-normal hover:bg-slate-200/60'
                            }`}
                          >
                            <span>{labels[level].name}</span>
                            <span className="text-[9px] opacity-75">{level === 'low' ? '92% Loss' : labels[level].rate}</span>
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={!!gameStates[game.id]} 
                        onChange={() => toggleGame(game.id)} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Game Settings
        </button>
      </div>
    </div>
  );
}
