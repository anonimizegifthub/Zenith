import React, { useState, useEffect } from 'react';
import { generateVeoVideo } from '../services/geminiService';
import { Button } from './ui/Button';
import { LoadingBar } from './ui/LoadingBar';
import { Film, Sparkles, AlertTriangle, Download, Play, Zap, Cpu, Info } from 'lucide-react';

// Veo Engine Options
const VEO_ENGINES = {
  FAST: 'veo-3.1-fast-generate-preview',
  QUALITY: 'veo-3.1-generate-preview'
};

const VEO_DETAILS = {
  [VEO_ENGINES.FAST]: {
    name: "Veo 3.1 Fast",
    tier: "STANDARD SPEED",
    features: [
      "Waktu Render: Cepat (Rapid Prototyping)",
      "Kualitas: Standar Broadcast",
      "Efisiensi: Konsumsi token lebih rendah",
      "Penggunaan: Ideal untuk B-Roll & Quick Cuts"
    ],
    color: "text-cyan-600",
    border: "border-cyan-200"
  },
  [VEO_ENGINES.QUALITY]: {
    name: "Veo 3.1 Quality",
    tier: "HIGH FIDELITY",
    features: [
      "Waktu Render: Lebih lama (Deep Processing)",
      "Kualitas: Sinematik & Fisika Akurat",
      "Detail: Tekstur & pencahayaan superior",
      "Penggunaan: Ideal untuk Hero Shots & Intro"
    ],
    color: "text-purple-600",
    border: "border-purple-200"
  }
};

export const VeoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [selectedEngine, setSelectedEngine] = useState(VEO_ENGINES.FAST);
  const [manualApiKey, setManualApiKey] = useState('');
  
  const [hasKey, setHasKey] = useState(false);
  const [keyChecked, setKeyChecked] = useState(false);

  // Set default prompt from context if available? Or just leave examples.
  
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
      setHasKey(true); // Optimistic update as per guidelines
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setStatus(`INITIALIZING ${selectedEngine === VEO_ENGINES.QUALITY ? 'HIGH-FIDELITY' : 'FAST'} CORE...`);
    setProgress(0);

    let interval: any;
    try {
      // Simulate progress since Veo takes a while
      const msgs = ['RENDERING PHYSICS...', 'CALCULATING LIGHT PATHS...', 'COMPOSITING FRAMES...', 'FINALIZING OUTPUT...'];
      let msgIdx = 0;
      let currentProgress = 0;
      
      interval = setInterval(() => {
        if (msgIdx < msgs.length) {
          setStatus(msgs[msgIdx]);
          msgIdx++;
        }
        currentProgress += (100 / msgs.length); // Rough approximation
        if (currentProgress > 95) currentProgress = 95; // Cap it
        setProgress(currentProgress);
      }, 8000);

      const url = await generateVeoVideo(prompt, selectedEngine, manualApiKey || undefined);
      
      if (!url) {
        throw new Error('Video generation completed but returned no data (possibly filtered).');
      }

      clearInterval(interval);
      setProgress(100);
      setVideoUrl(url);
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
        // Fallback to original msg
      }
      
      if (errMsg.includes('Requested entity was not found')) {
        setHasKey(false);
        setError('API Key validation failed. Please select your key again.');
      } else if (errMsg.includes('PERMISSION_DENIED') || errMsg.includes('permission') || errMsg.includes('403')) {
        setError('AKSES DITOLAK (403): Model Veo memerlukan API Key dengan Billing Aktif. Anda harus mengaktifkan Pay-as-you-go di Google Cloud Project Anda untuk menggunakan Veo.');
      } else {
        setError(`Video generation failed: ${errMsg}`);
      }
    } finally {
      clearInterval(interval);
      setLoading(false);
      setStatus('');
    }
  };

  if (!keyChecked) return null;

  if (!hasKey && !manualApiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-6 animate-fade-in border border-dashed border-slate-200 rounded-lg bg-slate-50 m-4">
        <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center border border-yellow-200">
           <AlertTriangle className="w-8 h-8 text-yellow-600" />
        </div>
        <div>
          <h2 className="text-xl font-mono text-slate-800 mb-2">RESTRICTED ACCESS // VEO ENGINE</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
            Modul Visualizer Veo memerlukan Paid API Key (Google Cloud Project) untuk beroperasi.
          </p>
          <div className="flex flex-col gap-3 items-center">
            <Button onClick={handleSelectKey} className="bg-pink-600 hover:bg-pink-700">
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

  const activeDetails = VEO_DETAILS[selectedEngine];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="border-b border-pink-100 pb-4">
        <h2 className="text-2xl font-mono text-pink-600 flex items-center gap-2">
          <Film className="w-6 h-6" />
          VEUALIZER STUDIO (VEO ENGINE)
        </h2>
        <p className="text-slate-500 text-sm mt-1">Sintesis video visualizer 1080p untuk latar belakang lagu Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">

          {/* Engine Selector */}
          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
             <label className="text-xs font-mono text-slate-500 uppercase block mb-3 flex items-center gap-2">
               <Cpu className="w-3 h-3 text-pink-600" /> Pilih Video Engine
             </label>
             <div className="flex gap-2 mb-4">
                <button 
                  onClick={() => setSelectedEngine(VEO_ENGINES.FAST)}
                  className={`flex-1 py-2 px-3 rounded text-xs font-mono font-bold transition-all border ${
                    selectedEngine === VEO_ENGINES.FAST 
                    ? 'bg-pink-50 border-pink-500 text-pink-600 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  VEO FAST
                </button>
                <button 
                  onClick={() => setSelectedEngine(VEO_ENGINES.QUALITY)}
                  className={`flex-1 py-2 px-3 rounded text-xs font-mono font-bold transition-all border ${
                    selectedEngine === VEO_ENGINES.QUALITY 
                    ? 'bg-purple-50 border-purple-500 text-purple-600 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  VEO QUALITY
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
             <div className={`absolute top-0 left-0 w-1 h-full opacity-50 ${selectedEngine === VEO_ENGINES.QUALITY ? 'bg-purple-600' : 'bg-pink-600'}`}></div>
             <label className={`text-xs font-mono uppercase block mb-3 flex items-center gap-2 font-bold ${selectedEngine === VEO_ENGINES.QUALITY ? 'text-purple-600' : 'text-pink-600'}`}>
               <Zap className="w-3 h-3" /> Music Visualizer Prompt
             </label>
             <textarea 
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               className={`w-full h-48 bg-slate-50 border border-slate-200 rounded p-4 text-slate-800 outline-none transition-all font-sans text-sm leading-relaxed placeholder:text-slate-400 focus:ring-1 ${selectedEngine === VEO_ENGINES.QUALITY ? 'focus:border-purple-500 focus:ring-purple-500' : 'focus:border-pink-500 focus:ring-pink-500'}`}
               placeholder="Contoh: Emotional lofi animation, a cozy bedroom with neon lights, raining outside the window, lo-fi aesthetic, aesthetic study girl style, highly detailed, looping animation..."
             />
             <div className="mt-4 flex justify-between items-center">
               <span className="text-xs text-slate-400 font-mono">ASPECT RATIO: 16:9 (DEFAULT)</span>
               <Button 
                onClick={handleGenerate} 
                isLoading={loading} 
                disabled={!prompt.trim()}
                className={`shadow-md ${selectedEngine === VEO_ENGINES.QUALITY ? 'bg-purple-600 hover:bg-purple-700 border-purple-800' : 'bg-pink-600 hover:bg-pink-700 border-pink-800'}`}
               >
                 <Sparkles className="w-4 h-4" /> INITIATE RENDER
               </Button>
             </div>
          </div>
          
          {loading && (
             <LoadingBar 
               text="VEO ENGINE ACTIVE" 
               subtext={status} 
               progress={progress}
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
           <label className="text-xs font-mono text-slate-500 uppercase block mb-3 font-bold">
             Viewport Output
           </label>
           
           <div className="flex-1 bg-slate-900 rounded border border-slate-200 flex items-center justify-center overflow-hidden relative group shadow-inner">
             {videoUrl ? (
               <video 
                 src={videoUrl} 
                 controls 
                 className="w-full h-full object-contain" 
                 autoPlay 
                 loop
               />
             ) : (
               <div className="text-slate-700 flex flex-col items-center">
                 <Play className="w-16 h-16 mb-4 opacity-10" />
                 <span className="font-mono text-xs opacity-30 tracking-[0.2em] text-slate-500">AWAITING DATA STREAM</span>
               </div>
             )}
           </div>

           {videoUrl && (
             <div className="mt-4 flex justify-end">
               <a 
                 href={videoUrl} 
                 download={`void_horizon_veo_${Date.now()}.mp4`}
                 className="inline-flex"
               >
                 <Button variant="secondary" className="border-slate-200 shadow-sm font-mono text-xs">
                   <Download className="w-4 h-4 mr-2" /> EXPORT MP4
                 </Button>
               </a>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};