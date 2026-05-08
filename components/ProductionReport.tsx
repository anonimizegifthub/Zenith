import React, { useState } from 'react';
import { Topic, SEOPackage, SongStudioData } from '../types';
import { Button } from './ui/Button';
import { RotateCcw, Download, Save, Check, FileJson, Music, ClipboardCheck } from 'lucide-react';

interface ProductionReportProps {
  topic: Topic;
  seoData: SEOPackage | null;
  songData: SongStudioData | null;
  onSaveProject: () => void; 
  onReset: () => void;
}

export const ProductionReport: React.FC<ProductionReportProps> = ({ 
  topic, 
  seoData, 
  songData, 
  onSaveProject, 
  onReset 
}) => {
  const [justSaved, setJustSaved] = useState(false);

  const handleSave = () => {
    onSaveProject();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  };

  const handleExportJSON = () => {
    if (!seoData || !songData) return;

    const projectData = {
      id: `local_${Date.now()}`, 
      createdAt: Date.now(),
      lastModified: new Date().toLocaleString('id-ID'),
      topic: topic,
      seoData: seoData,
      songData: songData
    };

    const jsonStr = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VOID_PROJECT_${topic.title.substring(0, 15).replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
  };

  const exportFullProjectText = () => {
    if (!seoData || !songData) return;

    let content = `VOID MUSIC - PRODUCTION REPORT\n`;
    content += `===============================\n\n`;
    content += `TOPIC: ${topic.title}\n`;
    content += `GENRE: ${topic.genre}\n`;
    content += `MOOD: ${topic.mood}\n\n`;

    content += `--- MODULE 2: SONIC OPTIMIZATION ---\n`;
    content += `Suno Style: ${seoData.sunoStyle}\n\n`;
    content += `Title Variants:\n`;
    content += `1: ${seoData.titleVariants.searchFocused}\n`;
    content += `2: ${seoData.titleVariants.emotionalClickbait}\n`;
    content += `3: ${seoData.titleVariants.shortForm}\n\n`;
    
    content += `Description:\n${seoData.description}\n\n`;
    content += `Tags: ${seoData.tags.join(', ')}\n\n`;

    content += `--- MODULE 3: SONG PRODUCTION & LYRICS ---\n`;
    content += `[ PRODUCTION DESCRIPTION ]\n${songData.productionDescription}\n\n`;
    content += `[ FULL LYRICS ]\n${songData.lyrics}\n\n`;
    content += `[ VISUALIZER PROMPT ]\n${songData.visualizerPrompt}\n\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FULL_REPORT_${topic.title.replace(/\s+/g, '_')}.txt`;
    a.click();
  };

  if (!seoData || !songData) return null;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-mono text-cyan-600 flex items-center justify-center gap-3 mb-4">
          <ClipboardCheck className="w-8 h-8 text-cyan-700" />
          FINAL PRODUCTION REPORT
        </h2>
        <p className="text-slate-500">Arsitektur lagu selesai. Semua data siap untuk digunakan di Suno AI.</p>
      </div>

      <div className="bg-white border border-slate-200 p-8 rounded-2xl relative overflow-hidden shadow-md">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-600 to-blue-600"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div>
            <h3 className="text-xs font-mono text-cyan-600 uppercase tracking-widest mb-4 font-bold">Song Metadata</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-mono">Title</label>
                <p className="text-slate-900 font-bold text-xl">{seoData.titleVariants.searchFocused}</p>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-mono">Genre & Mood</label>
                <p className="text-slate-700">{topic.genre} / {topic.mood}</p>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-mono">Suno Style Prompt</label>
                <div className="bg-slate-50 p-3 rounded text-xs font-mono text-cyan-800 mt-1 border border-slate-200">
                  {seoData.sunoStyle}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col justify-center items-center p-6 border border-slate-200 bg-slate-50 rounded-xl text-center">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-cyan-600" />
            </div>
            <h4 className="text-slate-900 font-bold mb-1 font-mono uppercase">Production Complete</h4>
            <p className="text-xs text-slate-500">Anda sekarang bisa mengekspor data ini untuk arsip atau melanjutkan ke tahap pembuatan video di Suno/Veo.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-4 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={handleSave} variant="primary" className={justSaved ? "!bg-green-600 border-green-700" : "bg-cyan-600 hover:bg-cyan-700"}>
             {justSaved ? <><Check className="w-4 h-4 mr-2" /> TERSIMPAN</> : <><Save className="w-4 h-4 mr-2" /> SIMPAN PROYEK</>}
          </Button>
          
          <Button onClick={handleExportJSON} variant="secondary" className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 shadow-sm">
              <FileJson className="w-4 h-4 mr-2" /> EKSPOR JSON
          </Button>

          <Button onClick={exportFullProjectText} variant="secondary" className="border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm">
              <Download className="w-4 h-4 mr-2" /> LAPORAN TXT
          </Button>
        </div>
        
        <div className="flex justify-center mt-4">
          <Button onClick={onReset} variant="secondary" className="text-xs py-2 px-4 opacity-70 hover:opacity-100 bg-transparent border-slate-200 text-slate-400 shadow-none">
            <RotateCcw className="w-3 h-3 mr-2" /> MULAI PRODUKSI BARU
          </Button>
        </div>
      </div>
    </div>
  );
};
