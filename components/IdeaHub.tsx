import React, { useState, useEffect, useRef } from 'react';
import { generateIdeas, optimizeManualTopic } from '../services/geminiService';
import { Topic, SavedProject, Region, MusicGenre, MusicMood, ProductionMode, ChannelProfile } from '../types';
import { Button } from './ui/Button';
import { LoadingBar } from './ui/LoadingBar';
import { Sparkles, TrendingUp, Eye, Zap, AlertTriangle, RefreshCw, PenTool, ArrowRight, Save, Clock, Trash2, FolderOpen, Upload, Download, FileJson, Globe, Filter, Check, Search, ExternalLink, RotateCcw, LayoutPanelLeft } from 'lucide-react';

interface IdeaHubProps {
  onSelectTopic: (topic: Topic) => void;
  onLoadProject: (project: SavedProject) => void;
  persistentIdeas: Topic[];
  onIdeasUpdate: (ideas: Topic[]) => void;
  channelProfile: ChannelProfile;
}

export const IdeaHub: React.FC<IdeaHubProps> = ({ 
  onSelectTopic, 
  onLoadProject,
  persistentIdeas,
  onIdeasUpdate,
  channelProfile
}) => {
  const [ideas, setIdeas] = useState<Topic[]>(persistentIdeas);
  
  // Sync internal state with props if they change externally (like on load project)
  useEffect(() => {
    setIdeas(persistentIdeas);
  }, [persistentIdeas]);

  // Update parent whenever ideas change locally
  const updateIdeas = (newIdeas: Topic[]) => {
    setIdeas(newIdeas);
    onIdeasUpdate(newIdeas);
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  
  // New States for Filters
  const [selectedRegion, setSelectedRegion] = useState<Region>(Region.GLOBAL);
  const [selectedCategories, setSelectedCategories] = useState<MusicGenre[]>([]);
  const [selectedMood, setSelectedMood] = useState<MusicMood | 'ALL'>('ALL');
  const [selectedMode, setSelectedMode] = useState<ProductionMode>(ProductionMode.GENRE_PURITY);
  
  // Manual Input State
  const [manualInput, setManualInput] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [useSearchGrounding, setUseSearchGrounding] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleCategory = (cat: MusicGenre) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Custom API Key State
  const [userApiKey, setUserApiKey] = useState(localStorage.getItem('user_gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const saveApiKey = () => {
    localStorage.setItem('user_gemini_api_key', userApiKey);
    setShowKeyInput(false);
    alert('API Key disimpan secara lokal. Silakan coba generate kembali.');
  };

  const removeApiKey = () => {
    localStorage.removeItem('user_gemini_api_key');
    setUserApiKey('');
    alert('API Key komersial dihapus. Sistem akan kembali menggunakan Key default.');
  };

  const fetchIdeas = async () => {
    setLoading(true);
    setError(false);
    updateIdeas([]);
    setErrorMessage('');
    try {
      const result = await generateIdeas(selectedRegion, selectedCategories, useSearchGrounding, selectedMode, channelProfile);
      if (result && result.length > 0) {
        // Sort by CTR descending
        const sortedIdeas = [...result].sort((a, b) => b.predictedCTR - a.predictedCTR);
        updateIdeas(sortedIdeas);
      } else {
        setError(true);
        setErrorMessage('Tautan saraf tidak stabil. Tidak ada topik yang diterima dari mesin.');
      }
    } catch (error: any) {
      console.error(error);
      setError(true);
      setErrorMessage(error.message || 'Kegagalan sistem tidak dikenal.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualInput.trim()) return;
    setManualLoading(true);
    try {
      const optimizedTopic = await optimizeManualTopic(manualInput, useSearchGrounding);
      if (optimizedTopic) {
        updateIdeas([optimizedTopic, ...ideas]);
        setManualInput('');
      }
    } catch (e) {
      console.error("Manual optimization failed", e);
    } finally {
      setManualLoading(false);
    }
  };

  const loadSavedProjects = () => {
    try {
      const stored = localStorage.getItem('void_horizon_projects');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Sort by newest first
        setSavedProjects(parsed.sort((a: SavedProject, b: SavedProject) => b.createdAt - a.createdAt));
      }
    } catch (e) {
      console.error("Failed to load projects", e);
    }
  };

  const deleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Apakah Anda yakin ingin menghapus arsip proyek ini? Data tidak dapat dipulihkan.')) {
      const updated = savedProjects.filter(p => p.id !== id);
      setSavedProjects(updated);
      localStorage.setItem('void_horizon_projects', JSON.stringify(updated));
    }
  };

  const clearAllProjects = () => {
    if (confirm('PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SEMUA arsip proyek? Semua data lokal akan hilang selamanya.')) {
      setSavedProjects([]);
      localStorage.removeItem('void_horizon_projects');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        // Simple validation
        if (parsed.topic && (parsed.songData || parsed.script)) {
          onLoadProject(parsed);
        } else {
          alert("Format file proyek tidak valid (Invalid JSON Structure).");
        }
      } catch (err) {
        console.error(err);
        alert("Gagal membaca file. Pastikan formatnya JSON.");
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const handleExportJSON = (project: SavedProject, e: React.MouseEvent) => {
    e.stopPropagation();
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VOID_BACKUP_${project.topic.title.substring(0, 15).replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
  };

  useEffect(() => {
    // fetchIdeas(); // Manual trigger only
    loadSavedProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-pink-100 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-mono text-pink-600 flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            MODUL 1: THE IDEA MUSIC HUB
          </h2>
          <p className="text-slate-500 text-sm mt-1">Membangun arsitektur suara dan potensi sonik...</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <button 
              onClick={() => setShowKeyInput(!showKeyInput)}
              className={`px-3 py-1 text-[10px] font-mono border rounded transition-all flex items-center gap-2 ${
                userApiKey 
                  ? 'border-green-600 text-green-700 bg-green-50' 
                  : 'border-slate-200 text-slate-500 hover:text-cyan-600 hover:border-cyan-600'
              }`}
            >
              <Zap className={`w-3 h-3 ${userApiKey ? 'text-green-600' : ''}`} />
              {userApiKey ? 'NEURAL OVERRIDE ACTIVE' : 'MANUAL API LINK'}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".json" 
              className="hidden" 
            />
            <Button onClick={handleImportClick} variant="secondary">
              <Upload className="w-4 h-4" /> IMPORT
            </Button>
            
            {/* Grounding Toggle */}
            <button
               onClick={() => setUseSearchGrounding(!useSearchGrounding)}
               className={`px-3 py-1 text-[10px] font-mono border rounded transition-all flex items-center gap-2 ${
                 useSearchGrounding 
                   ? 'border-pink-300 text-pink-600 bg-pink-50 shadow-sm' 
                   : 'border-slate-200 text-slate-500 hover:text-slate-700'
               }`}
               title="Aktifkan Grounding Pencarian Neural untuk data realtime"
            >
              <Search className={`w-3 h-3 ${useSearchGrounding ? 'animate-pulse' : ''}`} />
              NEURAL SEARCH {useSearchGrounding ? 'ON' : 'OFF'}
            </button>

            <Button onClick={fetchIdeas} variant="secondary" isLoading={loading} disabled={manualLoading}>
              <RefreshCw className="w-4 h-4" /> REKOMENDASI MUSIK
            </Button>

            {ideas.length > 0 && (
              <Button onClick={() => updateIdeas([])} variant="secondary" className="border-red-200 text-red-600 hover:bg-red-50">
                <RotateCcw className="w-4 h-4" /> RESET IDE
              </Button>
            )}
          </div>

          {showKeyInput && (
            <div className="w-full md:w-80 bg-white border border-slate-200 p-4 rounded-lg shadow-2xl mt-2 animate-in fade-in slide-in-from-top-2 z-10">
              <label className="text-[10px] font-mono text-slate-500 uppercase block mb-2">Gemini API Key (Local Secure)</label>
              <input 
                type="password"
                value={userApiKey}
                onChange={(e) => setUserApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-mono text-cyan-600 focus:border-cyan-500 outline-none mb-3"
              />
              <div className="flex gap-2">
                <button 
                  onClick={saveApiKey}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold py-1.5 rounded uppercase"
                >
                  SIMPAN
                </button>
                {userApiKey && (
                  <button 
                    onClick={removeApiKey}
                    className="px-2 bg-red-900/20 text-red-500 border border-red-900/50 rounded hover:bg-red-900/40"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-[9px] text-slate-600 mt-2 italic leading-tight">
                *Key disimpan di browser Anda saja (LocalStorage).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 bg-slate-50 border border-slate-200 p-5 rounded-lg shadow-sm">
          <label className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-2 mb-3">
            <Globe className="w-3 h-3 text-cyan-600" /> Fokus Wilayah (Tren Regional)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(Region).map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-3 py-2 text-xs font-mono rounded border transition-all ${
                  selectedRegion === region 
                    ? 'bg-cyan-50 border-cyan-500 text-cyan-700 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                {region.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-slate-50 border border-slate-200 p-5 rounded-lg shadow-sm">
          <label className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-2 mb-3">
            <LayoutPanelLeft className="w-3 h-3 text-emerald-600" /> Production Mode (Consistency)
          </label>
          <div className="flex flex-col gap-2">
            {Object.values(ProductionMode).map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-3 py-2 text-left text-xs font-mono rounded border transition-all flex items-center justify-between ${
                  selectedMode === mode 
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                <span>{mode.toUpperCase()}</span>
                {selectedMode === mode && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-slate-50 border border-slate-200 p-5 rounded-lg shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="flex-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-2 mb-3">
                <Filter className="w-3 h-3 text-pink-600" /> Genre Eksplorasi
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.values(MusicGenre).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 text-[10px] font-mono rounded-full border transition-all flex items-center gap-1 ${
                      selectedCategories.includes(cat)
                        ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                    }`}
                  >
                    {selectedCategories.includes(cat) && <Check className="w-2 h-2" />}
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="w-full">
              <label className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-2 mb-3">
                <Sparkles className="w-3 h-3 text-pink-600" /> Filter Mood
              </label>
              <select 
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs font-mono text-slate-700 focus:border-pink-500 outline-none shadow-sm"
              >
                <option value="ALL">SEMUA MOOD</option>
                {Object.values(MusicMood).map(mood => (
                  <option key={mood} value={mood}>{mood.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Input Section */}
      <div className="bg-white border border-slate-200 p-6 rounded-lg relative group shadow-sm">
         <div className="absolute top-0 left-0 w-1 h-full bg-cyan-600 opacity-50"></div>
          <label className="text-xs font-mono text-pink-600 uppercase block mb-3 flex items-center gap-2">
            <PenTool className="w-3 h-3" /> Ide Musik / Pesan Songwriter (Manual)
          </label>
          <div className="flex gap-4">
            <input 
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              placeholder="Masukkan ide lagu... Contoh: 'Lagu piano sedih tentang rindu ibu di desa'"
              className="flex-1 bg-slate-50 border border-slate-200 rounded px-4 py-3 text-slate-800 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all font-sans text-sm placeholder:text-slate-400"
            />
            <Button onClick={handleManualSubmit} isLoading={manualLoading} disabled={!manualInput.trim() || loading} className="bg-pink-600 hover:bg-pink-700">
              OPTIMALKAN IDE <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-slate-600 mt-2 font-mono ml-1">
            *AI akan mengubah ide mentah Anda menjadi konsep lagu yang memiliki struktur dan potensi viral.
          </p>
      </div>

      {/* Generated Ideas */}
      {loading ? (
        <LoadingBar 
          text="MENGHUBUNGKAN KE NEURAL CORE..." 
          subtext="MENGANALISIS DATA SOSIAL, EKONOMI, DAN TREN LINTAS GLOBAL..." 
        />
      ) : error ? (
        <div className="h-64 flex flex-col items-center justify-center border border-dashed border-red-200 rounded-lg bg-red-50 p-6 text-center shadow-sm">
          <AlertTriangle className="w-12 h-12 text-red-600 mb-4" />
          <h3 className="text-red-700 font-mono font-bold mb-2 uppercase tracking-tighter">Kesalahan Jalur Saraf (API Error)</h3>
          <p className="text-slate-600 mb-6 text-sm max-w-md">
            {errorMessage.includes("API KEY TIDAK DITEMUKAN") ? (
              <>
                <span className="text-red-600 font-bold block mb-2 underline">API KEY TIDAK DITEMUKAN</span>
                Silakan tambahkan <code className="bg-white border border-slate-200 px-1 rounded">GEMINI_API_KEY</code> di pengaturan environment variables Vercel atau AI Studio, lalu lakukan <strong>re-deploy (Deploy ulang)</strong>.
              </>
            ) : errorMessage}
          </p>
          <div className="flex gap-4">
            <Button onClick={fetchIdeas} variant="secondary">
              <RefreshCw className="w-4 h-4" /> RE-KONEKSI NEURAL
            </Button>
          </div>
        </div>
      ) : ideas.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center border border-dashed border-cyan-200 rounded-lg bg-cyan-50 shadow-sm">
          <Sparkles className="w-12 h-12 text-cyan-600 mb-4" />
          <h3 className="text-cyan-700 font-mono font-bold mb-2">GENERATOR IDE SIAP</h3>
          <p className="text-slate-500 mb-6 text-sm">Mengeksplorasi Sains, Ekonomi, Sosial, dan Tren Bisnis dengan tema "What If!".</p>
          <Button onClick={fetchIdeas} variant="primary">
            <Zap className="w-4 h-4" /> MULAI GENERASI IDE
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((topic, idx) => (
            <div 
              key={idx}
              className="bg-white border border-slate-200 hover:border-pink-500/50 p-6 rounded-lg transition-all duration-300 group cursor-pointer relative overflow-hidden shadow-sm hover:shadow-md"
              onClick={() => onSelectTopic(topic)}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-pink-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                {topic.title}
              </h3>

              <div className="flex flex-wrap gap-2 mb-4">
                {topic.genre && (
                  <span className="px-2 py-1 bg-pink-50 border border-pink-100 text-pink-700 text-[10px] uppercase font-mono rounded">
                    {topic.genre}
                  </span>
                )}
                {topic.mood && (
                  <span className="px-2 py-1 bg-purple-50 border border-purple-100 text-purple-700 text-[10px] uppercase font-mono rounded">
                    {topic.mood}
                  </span>
                )}
                {topic.tempo && (
                  <span className="px-2 py-1 bg-orange-50 border border-orange-100 text-orange-700 text-[10px] uppercase font-mono rounded">
                    {topic.tempo}
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-50 p-3 rounded border border-slate-100">
                  <div className="flex items-center gap-2 text-pink-600 text-xs font-mono mb-1 uppercase">
                    <TrendingUp className="w-3 h-3" /> Potensi Viral
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">{topic.viralLogic}</p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">Earworm Potential / CATCHY RATE</div>
                    <div className="text-sm font-bold text-pink-600 font-mono">
                      {(topic.predictedCTR < 1 ? topic.predictedCTR * 100 : topic.predictedCTR).toFixed(1)}%
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-600 to-pink-400 shadow-sm transition-all duration-1000" 
                      style={{ width: `${Math.min((topic.predictedCTR < 1 ? topic.predictedCTR * 100 : topic.predictedCTR), 100)}%` }} 
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-purple-600 text-xs font-mono mb-1 uppercase">
                    <Eye className="w-3 h-3" /> Konsep Musik Video (Veo)
                  </div>
                  <p className="text-slate-600 text-xs">{topic.visualPotential}</p>
                </div>

                {/* Grounding Sources */}
                {topic.sources && topic.sources.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 mt-3">
                    <div className="flex items-center gap-2 text-green-700 text-[10px] font-mono mb-2 uppercase">
                      <Search className="w-3 h-3" /> Neural Grounding Sources
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {topic.sources.slice(0, 3).map((source, sIdx) => (
                        <a 
                          key={sIdx}
                          href={source.uri}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-[9px] bg-slate-50 px-2 py-1 rounded text-slate-500 hover:text-cyan-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                        >
                          <ExternalLink className="w-2 h-2" /> {source.title.length > 20 ? source.title.substring(0, 20) + '...' : source.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <span className="text-xs font-mono text-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-bold">
                  MULAI SEKUENS <Zap className="w-3 h-3 text-cyan-600" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Saved Projects Section */}
      <div className="pt-8 border-t border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-mono text-slate-500 flex items-center gap-2">
            <Save className="w-4 h-4" /> ARSIP PROYEK (DATABASE LOKAL)
          </h3>
          {savedProjects.length > 0 && (
            <button 
              onClick={clearAllProjects}
              className="text-[10px] font-mono text-red-600 hover:text-red-700 flex items-center gap-1 px-2 py-1 border border-red-200 rounded hover:bg-red-50 transition-all uppercase tracking-tighter"
            >
              <Trash2 className="w-3 h-3" /> Hapus Semua Arsip
            </button>
          )}
        </div>
        
        {savedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedProjects.map((project) => (
              <div 
                key={project.id}
                className="bg-white border border-slate-200 p-4 rounded flex justify-between items-center hover:bg-slate-50 transition-colors cursor-pointer group shadow-sm"
                onClick={() => onLoadProject(project)}
              >
                <div>
                  <h4 className="text-slate-900 font-bold group-hover:text-cyan-700 transition-colors line-clamp-1">{project.topic.title}</h4>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 font-mono">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {project.lastModified}</span>
                    <span className="flex items-center gap-1">
                      <FolderOpen className="w-3 h-3" /> 
                      {project.songData ? '1' : (project as any).script?.length || '0'} Arsitektur
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={(e) => handleExportJSON(project, e)}
                     className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded transition-colors"
                     title="Backup JSON"
                   >
                     <Download className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={(e) => deleteProject(project.id, e)}
                     className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                     title="Hapus Proyek"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                   <Button variant="secondary" className="text-xs py-1 px-3">
                     BUKA
                   </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 bg-slate-50/50">
             <FileJson className="w-12 h-12 mx-auto mb-3 opacity-20" />
             <p className="text-sm">Belum ada proyek tersimpan di database lokal.</p>
             <p className="text-xs mt-1">Simpan proyek di Tahap Akhir (Modul 5) atau gunakan tombol <strong>IMPORT PROYEK</strong> di atas.</p>
          </div>
        )}
      </div>
    </div>
  );
};