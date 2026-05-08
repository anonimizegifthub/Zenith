import React, { useState } from 'react';
import { User, Save, Info, Sparkles, Palette, Camera, Hash } from 'lucide-react';
import { ChannelProfile } from '../types';
import { Button } from './ui/Button';

interface ChannelSettingsProps {
  profile: ChannelProfile;
  onSave: (profile: ChannelProfile) => void;
  onClose: () => void;
}

export const ChannelSettings: React.FC<ChannelSettingsProps> = ({ profile, onSave, onClose }) => {
  const [formData, setFormData] = useState<ChannelProfile>(profile);
  const [justSaved, setJustSaved] = useState(false);

  const handleSave = () => {
    onSave(formData);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-2xl w-full overflow-hidden animate-fade-in">
      <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 rounded-lg">
            <User className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-mono">CHANNEL SETTINGS</h2>
            <p className="text-xs text-slate-500 font-mono">Konfigurasi Identitas Visual Mindform</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Hash className="w-5 h-5 rotate-45" />
        </button>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> Nama Channel
            </label>
            <input 
              type="text" 
              value={formData.channelName}
              onChange={(e) => setFormData({...formData, channelName: e.target.value})}
              placeholder="Contoh: MINDFORM Music"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Camera className="w-3 h-3" /> Identitas Visual (DNA)
            </label>
            <input 
              type="text" 
              value={formData.visualIdentity}
              onChange={(e) => setFormData({...formData, visualIdentity: e.target.value})}
              placeholder="Contoh: Futuristic Cyberpunk, Lo-fi Aesthetic"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
               <Palette className="w-3 h-3" /> Palet Warna Kebanggaan
            </label>
            <input 
              type="text" 
              value={formData.signatureColors}
              onChange={(e) => setFormData({...formData, signatureColors: e.target.value})}
              placeholder="Contoh: Neon Pink & Cyan, Pastel Yellow"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <User className="w-3 h-3" /> Karakter Ikonik (Opsional)
            </label>
            <input 
              type="text" 
              value={formData.recurringCharacter || ''}
              onChange={(e) => setFormData({...formData, recurringCharacter: e.target.value})}
              placeholder="Contoh: Gadis dengan hoodie pink, Kucing astronot"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> Gaya Estetika & Mood Konsisten
          </label>
          <textarea 
            value={formData.aestheticStyle}
            onChange={(e) => setFormData({...formData, aestheticStyle: e.target.value})}
            placeholder="Deskripsikan gaya visual Anda secara detail agar AI bisa mempelajarinya..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 h-24 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all resize-none"
          />
        </div>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Data ini akan digunakan oleh engine AI sebagai "Anchor" (jangkar) untuk setiap prompt yang dihasilkan. Tujuannya adalah membangun <strong>Channel Cohesion</strong> yang kuat sehingga audiens langsung mengenali gaya visual Anda di homepage.
          </p>
        </div>
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} className="border-slate-200 shadow-sm">
          BATAL
        </Button>
        <Button 
          onClick={handleSave} 
          className={`min-w-[140px] ${justSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-pink-600 hover:bg-pink-700'}`}
        >
          {justSaved ? <Save className="w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {justSaved ? 'TERSESUAIKAN' : 'SIMPAN PROFIL'}
        </Button>
      </div>
    </div>
  );
};
