import React, { useState, useEffect } from 'react';
import { generateSongStudioData } from '../services/geminiService';
import { Topic, SongStudioData } from '../types';
import { Button } from './ui/Button';
import { LoadingBar } from './ui/LoadingBar';
import { Music, AlignLeft, Download, ArrowRight, Image, Copy, Sparkles, Zap } from 'lucide-react';

interface LyricStudioProps {
  topic: Topic;
  initialData?: SongStudioData | null;
  onUpdate?: (data: SongStudioData) => void;
  onComplete: (data: SongStudioData) => void;
}

export const LyricStudio: React.FC<LyricStudioProps> = ({ topic, initialData, onUpdate, onComplete }) => {
  const [songData, setSongData] = useState<SongStudioData | null>(initialData || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setSongData(initialData);
    }
  }, [initialData]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await generateSongStudioData(topic.title);
      if (data) {
        setSongData(data);
        if (onUpdate) onUpdate(data);
      }
    } catch (error) {
      console.error(error);
      alert('Gagal membuat lirik. Silakan coba lagi.');
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
            <Button onClick={() => songData && onComplete(songData)} disabled={!songData} className="bg-cyan-600 hover:bg-cyan-700">
              LANJUT KE LAPORAN <ArrowRight className="w-4 h-4" />
            </Button>
        </div>
      </div>

      {!songData && !loading && (
        <div className="bg-white border border-slate-200 p-20 rounded-lg text-center shadow-sm">
            <Sparkles className="w-16 h-16 text-pink-600 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-slate-900 mb-2 font-mono">STUDIO PENULIS LIRIK</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">AI akan menulis lirik lengkap dan deskripsi produksi yang dioptimalkan untuk Suno AI.</p>
            <Button onClick={handleGenerate} variant="primary" className="bg-pink-600 hover:bg-pink-700">
              BUAT LIRIK & PRODUKSI
            </Button>
        </div>
      )}

      {loading && (
        <LoadingBar 
          text="MENYUSUN LIRIK & ARSITEKTUR SONIK..."
          subtext="MENGHITUNG RITME, RIMA, DAN ATMOSFER UNTUK SUNO AI..."
        />
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
