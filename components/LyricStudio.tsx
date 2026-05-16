import React, { useState, useEffect } from 'react';
import { generateSongStudioData } from '../services/geminiService';
import { Topic, SongStudioData, ChannelProfile } from '../types';
import { Button } from './ui/Button';
import { LoadingBar } from './ui/LoadingBar';
import { Music, AlignLeft, Download, ArrowRight, Image, Copy, Sparkles, Zap, AlertTriangle, RefreshCw } from 'lucide-react';

interface LyricStudioProps {
  topic: Topic;
  initialData?: SongStudioData | null;
  onUpdate?: (data: SongStudioData) => void;
  onComplete: (data: SongStudioData) => void;
  channelProfile: ChannelProfile;
}

export const LyricStudio: React.FC<LyricStudioProps> = ({ topic, initialData, onUpdate, onComplete, channelProfile }) => {
  const [songData, setSongData] = useState<SongStudioData | null>(initialData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setSongData(initialData);
    } else if (!songData && !loading && !error) {
      // Auto-trigger generation if no data exists
      handleGenerate();
    }
  }, [initialData, songData, loading, error]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateSongStudioData(topic, channelProfile);
      if (data) {
        setSongData(data);
        if (onUpdate) onUpdate(data);
      }
    } catch (error: any) {
      console.error(error);
      setError(error.message || 'Gagal membuat lirik. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} berhasil disalin!`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-pink-100 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-mono text-pink-600 flex items-center gap-2">
            <Music className="w-6 h-6" />
            MODUL 3: LYRIC & VISUALIZER STUDIO
          </h2>
          <p className="text-slate-500 text-sm mt-1">Mengonversi arsitektur suara menjadi lirik dan instruksi Suno AI.</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={!songData || loading} variant="secondary">
              <RefreshCw className="w-4 h-4 mr-2" /> REGENERATE
            </Button>
            <Button onClick={() => songData && onComplete(songData)} disabled={!songData || loading} className="bg-cyan-600 hover:bg-cyan-700">
              LANJUT KE LAPORAN <ArrowRight className="w-4 h-4" />
            </Button>
        </div>
      </div>

      {loading && (
        <LoadingBar 
          text="MENYUSUN LIRIK & ARSITEKTUR SONIK..."
          subtext="MENGHITUNG RITME, RIMA, DAN ATMOSFER UNTUK SUNO AI..."
        />
      )}

      {error && !loading && (
        <div className="h-64 flex flex-col items-center justify-center border border-dashed border-red-200 rounded-lg bg-red-50 p-6 text-center animate-fade-in shadow-sm">
          <AlertTriangle className="w-12 h-12 text-red-600 mb-4" />
          <h3 className="text-red-700 font-mono font-bold mb-2 uppercase tracking-tighter">Kesalahan Jalur Saraf (API Error)</h3>
          <p className="text-slate-600 mb-6 text-sm max-w-md">
            {error}
          </p>
          <div className="flex gap-4">
            <Button onClick={handleGenerate} variant="secondary">
              <RefreshCw className="w-4 h-4" /> RE-KONEKSI NEURAL
            </Button>
          </div>
        </div>
      )}

      {songData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lyrics Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-mono">
                <AlignLeft className="w-5 h-5 text-pink-600" />
                FULL LYRICS
              </h3>
              <Button 
                onClick={() => copyToClipboard(songData.lyrics, 'Lirik')} 
                variant="secondary" 
                className="text-xs py-1 px-3 border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                <Copy className="w-3 h-3 mr-2" /> SALIN LIRIK
              </Button>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 font-serif text-lg leading-relaxed text-slate-800 whitespace-pre-wrap italic shadow-inner max-h-[600px] overflow-y-auto custom-scrollbar">
              {songData.lyrics}
            </div>
          </div>

          {/* Production & Visuals Section */}
          <div className="space-y-6">
            {/* Unified Master Prompt */}
            <div className="space-y-4 bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2 font-mono">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  UNIFIED MASTER PROMPT
                </h3>
                <Button 
                  onClick={() => copyToClipboard(songData.unifiedSunoPrompt, 'Unified Master Prompt')} 
                  variant="secondary" 
                  className="text-xs py-1 px-3 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                >
                  <Copy className="w-3 h-3 mr-2" /> SALIN MASTER
                </Button>
              </div>
              <div className="bg-white border border-indigo-200 rounded-lg p-4 font-mono text-sm text-indigo-800 leading-relaxed shadow-inner">
                {songData.unifiedSunoPrompt}
              </div>
              <div className="flex items-start gap-2 text-indigo-600">
                <Zap className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[10px] italic font-mono leading-tight">
                  OPTIMASI SIMPLE MODE: Tempel prompt ini ke kotak "Song Description" Suno AI Simple Mode untuk hasil paling akurat (Menggabungkan Style & Lirik).
                </p>
              </div>
            </div>

            {/* Song Description */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-mono">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  SONG DESCRIPTION
                </h3>
                <Button 
                  onClick={() => copyToClipboard(songData.productionDescription, 'Deskripsi Produksi')} 
                  variant="secondary" 
                  className="text-xs py-1 px-3 border-slate-200"
                >
                  <Copy className="w-3 h-3 mr-2" /> SALIN DESKRIPSI
                </Button>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-600 leading-normal whitespace-pre-wrap shadow-sm">
                {songData.productionDescription}
              </div>
              <p className="text-[10px] text-slate-400 italic font-mono">
                *Tuangkan ini ke kolom "Style of Music" di Custom Mode Suno AI untuk panduan struktur yang lebih detail.
              </p>
            </div>

            {/* Visualizer Prompt */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-mono">
                  <Image className="w-5 h-5 text-purple-600" />
                  VISUALIZER PROMPT
                </h3>
                <Button 
                  onClick={() => copyToClipboard(songData.visualizerPrompt, 'Visual Prompt')} 
                  variant="secondary" 
                  className="text-xs py-1 px-3 border-slate-200"
                >
                  <Copy className="w-3 h-3 mr-2" /> SALIN PROMPT
                </Button>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-600 leading-normal shadow-sm">
                {songData.visualizerPrompt}
              </div>
              <p className="text-[10px] text-slate-400 italic font-mono">
                *Prompt ini dioptimalkan untuk Google Veo atau AI generator video lainnya.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
