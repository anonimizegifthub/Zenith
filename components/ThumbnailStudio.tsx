import React, { useState, useEffect } from 'react';
import { generateThumbnail } from '../services/geminiService';
import { Button } from './ui/Button';
import { LoadingBar } from './ui/LoadingBar';
import { Image, Sparkles, AlertTriangle, Download, Zap, Monitor, Cpu, Info, Type, XCircle, Music } from 'lucide-react';

// Engine Options & Limitations
const ENGINES = {
  PRO: 'gemini-3-pro-image-preview',
  FLASH: 'gemini-2.5-flash-image'
};

const ENGINE_DETAILS = {
  [ENGINES.PRO]: {
    name: "Gemini 3.0 Pro Image",
    tier: "HIGH-FIDELITY (PAID)",
    features: [
      "Resolusi Output: 2K (High Res)",
      "Pencahayaan & Tekstur: Cinematic Advanced",
      "Komposisi: Sangat kompleks & patuh pada prompt",
      "Biaya: Premium (Billed per generation)"
    ],
    color: "text-pink-600",
    border: "border-pink-200"
  },
  [ENGINES.FLASH]: {
    name: "Gemini 2.5 Flash Image",
    tier: "STANDARD (EFFICIENT)",
    features: [
      "Resolusi Output: Standar (Cukup untuk Mobile)",
      "Pencahayaan: Basic / Flat",
      "Limitasi: Tidak mendukung config 'imageSize'",
      "Biaya: Hemat / Free Tier Eligible"
    ],
    color: "text-yellow-600",
    border: "border-yellow-200"
  }
};

export const ThumbnailStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedEngine, setSelectedEngine] = useState(ENGINES.PRO);
  const [includeText, setIncludeText] = useState(false);
  const [manualApiKey, setManualApiKey] = useState('');
  
  // Auth & Billing State
  const [hasKey, setHasKey] = useState(false);
  const [keyChecked, setKeyChecked] = useState(false);

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    try {
      if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
        const has = await (window as any).aistudio.hasSelectedApiKey();
        setHasKey(has);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setKeyChecked(true);
    }
  };

  const handleSelectKey = async () => {
    if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setHasKey(true); // Optimistic update
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const url = await generateThumbnail(prompt, selectedEngine, includeText, manualApiKey || undefined);
      if (url) {
        setImageUrl(url);
      } else {
        setError('Gagal menghasilkan gambar. Coba prompt yang berbeda.');
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || String(err);

      // Try to parse JSON error if it's a string
      try {
        if (typeof errMsg === 'string' && errMsg.includes('{')) {
          const jsonError = JSON.parse(errMsg.substring(errMsg.indexOf('{')));
          if (jsonError.error && jsonError.error.message) {
            errMsg = jsonError.error.message;
          }
        }
      } catch (e) {
        // Fallback
      }
      
      if (errMsg.includes('Requested entity was not found')) {
        setHasKey(false);
        setError('Validasi API Key gagal. Mohon pilih ulang Project Key Anda.');
      } else if (errMsg.includes('PERMISSION_DENIED') || errMsg.includes('permission') || errMsg.includes('403')) {
        setError('AKSES DITOLAK (403): Model Gambar memerlukan API Key dengan Billing Aktif. Anda harus mengaktifkan Pay-as-you-go di Google Cloud Project Anda untuk menggunakan fitur ini.');
      } else {
        setError(`Sistem pencitraan terganggu: ${errMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!keyChecked) return null;

  if (!hasKey && !manualApiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-6 animate-fade-in border border-dashed border-slate-200 rounded-lg bg-slate-50 m-4">
        <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center border border-pink-200">
           <AlertTriangle className="w-8 h-8 text-pink-600" />
        </div>
        <div>
          <h2 className="text-xl font-mono text-slate-800 mb-2">RESTRICTED ACCESS // IMAGEN ENGINE</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
            Modul Thumbnail memerlukan akses API Key yang valid (Paid/Free Tier Project).
          </p>
          <div className="flex flex-col gap-3 items-center">
            <Button onClick={handleSelectKey} className="bg-pink-600 hover:bg-pink-700 border-pink-800 shadow-md">
              CONNECT BILLING KEY
            </Button>
            <div className="text-xs text-slate-400 my-2">- OR -</div>
            <input 
              type="password"
              placeholder="Enter Manual API Key (Optional)"
              value={manualApiKey}
              onChange={(e) => setManualApiKey(e.target.value)}
              className="bg-white border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 w-64 text-center focus:border-pink-500 outline-none shadow-sm"
            />
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-pink-600 hover:text-pink-700 text-xs font-mono uppercase tracking-wider mt-2">
              [ Documentation Link ]
            </a>
          </div>
        </div>
      </div>
    );
  }

  const activeDetails = ENGINE_DETAILS[selectedEngine];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="border-b border-pink-100 pb-4">
        <h2 className="text-2xl font-mono text-pink-600 flex items-center gap-2">
          <Image className="w-6 h-6" />
          MODUL 7: COVER ART STUDIO
        </h2>
        <p className="text-slate-500 text-sm mt-1">Sintesis visual resolusi tinggi (16:9) untuk sampul lagu atau album Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          
          {/* Engine Selector */}
          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
             <label className="text-xs font-mono text-slate-500 uppercase block mb-3 flex items-center gap-2">
               <Cpu className="w-3 h-3 text-pink-600" /> Pilih Rendering Engine
             </label>
             <div className="flex gap-2 mb-4">
                <button 
                  onClick={() => setSelectedEngine(ENGINES.PRO)}
                  className={`flex-1 py-2 px-3 rounded text-xs font-mono font-bold transition-all border ${
                    selectedEngine === ENGINES.PRO 
                    ? 'bg-pink-50 border-pink-500 text-pink-600 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  GEMINI 3 PRO
                </button>
                <button 
                  onClick={() => setSelectedEngine(ENGINES.FLASH)}
                  className={`flex-1 py-2 px-3 rounded text-xs font-mono font-bold transition-all border ${
                    selectedEngine === ENGINES.FLASH 
                    ? 'bg-yellow-50 border-yellow-500 text-yellow-600 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  GEMINI 2.5 FLASH
                </button>
             </div>

             {/* Dynamic Engine Info */}
             <div className={`p-3 rounded border bg-slate-50 text-xs space-y-2 ${activeDetails.border} border-opacity-50`}>
                <div className={`font-bold flex items-center gap-2 ${activeDetails.color}`}>
                   <Info className="w-3 h-3" /> {activeDetails.name} <span className="opacity-50 font-mono">[{activeDetails.tier}]</span>
                </div>
                <ul className="space-y-1 text-slate-600 pl-5 list-disc">
                   {activeDetails.features.map((feat, i) => (
                     <li key={i}>{feat}</li>
                   ))}
                </ul>
             </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-lg relative group shadow-sm">
             <div className={`absolute top-0 left-0 w-1 h-full opacity-50 ${selectedEngine === ENGINES.PRO ? 'bg-pink-600' : 'bg-yellow-600'}`}></div>
             <label className={`text-xs font-mono uppercase block mb-3 flex items-center gap-2 font-bold ${selectedEngine === ENGINES.PRO ? 'text-pink-600' : 'text-yellow-600'}`}>
               <Zap className="w-3 h-3" /> Cover Art Command Prompt
             </label>
             <textarea 
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               className={`w-full h-48 bg-slate-50 border border-slate-200 rounded p-4 text-slate-800 outline-none transition-all font-sans text-sm leading-relaxed placeholder:text-slate-400 focus:ring-1 ${selectedEngine === ENGINES.PRO ? 'focus:border-pink-500 focus:ring-pink-500' : 'focus:border-yellow-500 focus:ring-yellow-500'}`}
               placeholder="Contoh: A synthwave city skyline with a giant pink sun, futuristic vibe, nostalgic, retrowave aesthetic, high quality album art..."
             />
             
             {/* Text Control Toggle */}
             <div className="mt-4 flex items-center justify-between bg-slate-50 p-3 rounded border border-slate-200 shadow-inner">
                <div className="flex items-center gap-3">
                  {includeText ? <Type className="w-4 h-4 text-pink-600" /> : <XCircle className="w-4 h-4 text-slate-400" />}
                  <div>
                    <span className={`text-xs font-bold font-mono block ${includeText ? 'text-pink-600' : 'text-slate-500'}`}>
                      {includeText ? 'SONG TITLE OVERLAY' : 'CLEAN MODE (NO TEXT)'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {includeText ? 'Menambahkan judul lagu dengan tipografi estetik.' : 'Hanya gambar visual murni tanpa teks.'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setIncludeText(!includeText)}
                  className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${includeText ? 'bg-pink-600' : 'bg-slate-300'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all duration-300 ${includeText ? 'left-6' : 'left-1 shadow-sm'}`}></div>
                </button>
             </div>

             <div className="mt-4 flex justify-between items-center">
               <span className="text-xs text-slate-400 font-mono">MODEL: {selectedEngine}</span>
                <Button 
                   onClick={handleGenerate} 
                   isLoading={loading} 
                   disabled={!prompt.trim()} 
                   className={`shadow-md ${selectedEngine === ENGINES.PRO ? 'bg-pink-600 hover:bg-pink-700 border-pink-800' : 'bg-yellow-600 hover:bg-yellow-700 border-yellow-800 text-white'}`}
                >
                  <Music className="w-4 h-4" /> GENERATE COVER ART
                </Button>
             </div>
          </div>
          
          {loading && (
             <LoadingBar 
               text="RENDERING ASET VISUAL..." 
               subtext={`MODEL DIFUSI PIKSEL (${selectedEngine === ENGINES.PRO ? 'HIGH-RES' : 'STD-RES'}) ${includeText ? '+ TEXT GEN' : '+ CLEAN'}`}
             />
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded text-red-700 text-sm flex items-center gap-3 shadow-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" /> 
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Output Section */}
        <div className="bg-white border border-slate-200 p-6 rounded-lg min-h-[400px] flex flex-col shadow-sm">
           <label className="text-xs font-mono text-slate-500 uppercase block mb-3 flex items-center gap-2 font-bold">
             <Monitor className="w-3 h-3" /> Canvas Preview (16:9)
           </label>
           
           <div className="flex-1 bg-slate-900 rounded border border-slate-200 flex items-center justify-center overflow-hidden relative group shadow-inner">
             {imageUrl ? (
               <img 
                 src={imageUrl} 
                 alt="Generated Thumbnail" 
                 className="w-full h-auto object-contain shadow-2xl" 
               />
             ) : (
               <div className="text-slate-700 flex flex-col items-center">
                 <Image className="w-16 h-16 mb-4 opacity-10" />
                 <span className="font-mono text-xs opacity-30 tracking-[0.2em] text-slate-500">NO SIGNAL</span>
               </div>
             )}
           </div>

           {imageUrl && (
             <div className="mt-4 flex justify-end">
               <a 
                 href={imageUrl} 
                 download={`void_horizon_thumb_${Date.now()}.png`}
                 className="inline-flex"
               >
                 <Button variant="secondary" className="border-slate-200 shadow-sm font-mono text-xs">
                   <Download className="w-4 h-4 mr-2" /> DOWNLOAD PNG
                 </Button>
               </a>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};