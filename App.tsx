import React, { useState } from 'react';
import { IdeaHub } from './components/IdeaHub';
import { AlgorithmSuite } from './components/AlgorithmSuite';
import { LyricStudio } from './components/LyricStudio';
import { ProductionReport } from './components/ProductionReport';
import { VeoStudio } from './components/VeoStudio';
import { ThumbnailStudio } from './components/ThumbnailStudio';
import { AppStage, Topic, SEOPackage, SongStudioData, SavedProject } from './types';
import { Layers, Film, Image } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'production' | 'veo' | 'thumbnail'>('production');
  const [stage, setStage] = useState<AppStage>(AppStage.IDEA_HUB);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [generatedIdeas, setGeneratedIdeas] = useState<Topic[]>([]);
  
  // State lifting for final export and saving
  const [seoData, setSeoData] = useState<SEOPackage | null>(null);
  const [songData, setSongData] = useState<SongStudioData | null>(null);

  const handleTopicSelect = (topic: Topic) => {
    if (selectedTopic?.title !== topic.title) {
      setSeoData(null);
      setSongData(null);
    }
    setSelectedTopic(topic);
    setStage(AppStage.ALGORITHM_SUITE);
  };

  const handleAlgorithmComplete = (data: SEOPackage) => {
    setSeoData(data);
    setStage(AppStage.SCRIPT_PRODUCTION);
  };

  const handleSongUpdate = (data: SongStudioData) => {
    setSongData(data);
  };

  const handleSongComplete = (data: SongStudioData) => {
    setSongData(data);
    setStage(AppStage.PRODUCTION_REPORT);
  };

  const handleSaveProject = () => {
    if (!selectedTopic || !seoData || !songData) {
      alert("Data proyek belum lengkap. Mohon selesaikan semua tahapan sebelum menyimpan.");
      return;
    }

    const newProject: SavedProject = {
      id: Date.now().toString(),
      createdAt: Date.now(),
      lastModified: new Date().toLocaleString('id-ID'),
      topic: selectedTopic,
      seoData: seoData,
      songData: songData,
      contextIdeas: generatedIdeas
    };

    try {
      const stored = localStorage.getItem('void_horizon_projects');
      const projects = stored ? JSON.parse(stored) : [];
      
      // Update if topic title exists (basic dedupe based on title for simplicity, or just append)
      const existingIdx = projects.findIndex((p: SavedProject) => p.topic.title === newProject.topic.title);
      
      if (existingIdx >= 0) {
        if (confirm("Versi lama dari proyek ini ditemukan. Timpa?")) {
           projects[existingIdx] = newProject;
        } else {
           return;
        }
      } else {
        projects.push(newProject);
      }

      localStorage.setItem('void_horizon_projects', JSON.stringify(projects));
      // alert("Proyek berhasil disimpan ke Database Lokal."); // Handled by UI feedback in button
    } catch (e) {
      console.error("Save failed", e);
      alert("Gagal menyimpan proyek. Storage mungkin penuh.");
    }
  };

  const handleLoadProject = (project: SavedProject) => {
    setSelectedTopic(project.topic);
    setSeoData(project.seoData);
    setSongData(project.songData);
    if (project.contextIdeas) {
      setGeneratedIdeas(project.contextIdeas);
    }
    
    // Determine the furthest completed stage
    if (project.songData) {
      setStage(AppStage.PRODUCTION_REPORT);
    } else if (project.seoData) {
      setStage(AppStage.ALGORITHM_SUITE);
    } else {
      setStage(AppStage.IDEA_HUB);
    }

    setActiveTab('production');
  };

  const resetApp = () => {
    setSelectedTopic(null);
    setGeneratedIdeas([]);
    setSeoData(null);
    setSongData(null);
    setStage(AppStage.IDEA_HUB);
  };

  return (
    <div className="min-h-screen bg-void-900 text-slate-900 font-sans selection:bg-pink-100 selection:text-pink-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-pink-600 rounded flex items-center justify-center text-white font-bold font-mono text-xl shadow-sm">
              V
            </div>
            <div>
              <h1 className="font-mono font-bold text-lg tracking-wider text-slate-900 uppercase">Void Music</h1>
              <div className="text-[10px] text-pink-600 tracking-[0.2em] font-mono leading-none">AI MUSIC PRODUCTION V1.0</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 absolute left-1/2 transform -translate-x-1/2">
             <button 
               onClick={() => setActiveTab('production')}
               className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-mono font-bold transition-all ${
                 activeTab === 'production' 
                   ? 'bg-white text-pink-600 shadow-sm border border-slate-200' 
                   : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               <Layers className="w-3 h-3" /> ENGINE
             </button>
             <button 
               onClick={() => setActiveTab('veo')}
               className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-mono font-bold transition-all ${
                 activeTab === 'veo' 
                   ? 'bg-white text-purple-600 shadow-sm border border-slate-200' 
                   : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               <Film className="w-3 h-3" /> VISUALIZER
             </button>
             <button 
               onClick={() => setActiveTab('thumbnail')}
               className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-mono font-bold transition-all ${
                 activeTab === 'thumbnail' 
                   ? 'bg-white text-pink-600 shadow-sm border border-slate-200' 
                   : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               <Image className="w-3 h-3" /> COVER ART
             </button>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-500 w-[200px] justify-end">
            {activeTab === 'production' && (
               <div className="flex items-center gap-2 text-pink-600 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-pink-600"></div>
                  STUDIO ONLINE
               </div>
            )}
             {activeTab === 'veo' && (
               <div className="flex items-center gap-2 text-purple-600 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                  GENERATIVE
               </div>
            )}
            {activeTab === 'thumbnail' && (
               <div className="flex items-center gap-2 text-pink-600 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-pink-600"></div>
                  IMAGEN
               </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Tab 1: Production Engine (Preserved State using display style) */}
          <div className={activeTab === 'production' ? 'block' : 'hidden'}>
            
            {/* Interactive Stage Progress Navigation */}
            <div className="mb-8 flex flex-wrap gap-4 text-xs font-mono text-slate-500 border-b border-slate-200 pb-4 justify-center md:justify-start">
                <button 
                  onClick={() => setStage(AppStage.IDEA_HUB)}
                  className={`flex items-center gap-2 transition-colors hover:text-pink-600 ${stage === AppStage.IDEA_HUB ? 'text-pink-600 font-bold' : ''}`}
                >
                  <span className={`w-2 h-2 rounded-full ${stage === AppStage.IDEA_HUB ? 'bg-pink-600' : 'bg-slate-300'}`}></span> IDEASI MUSIK
                </button>
                
                <div className={`w-8 h-px bg-slate-200 hidden md:block`}></div>
                
                <button 
                  onClick={() => selectedTopic && setStage(AppStage.ALGORITHM_SUITE)}
                  disabled={!selectedTopic}
                  className={`flex items-center gap-2 transition-colors ${
                    stage === AppStage.ALGORITHM_SUITE ? 'text-pink-600 font-bold' : ''
                  } ${!selectedTopic ? 'opacity-50 cursor-not-allowed' : 'hover:text-pink-600'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${stage === AppStage.ALGORITHM_SUITE ? 'bg-pink-600' : selectedTopic ? 'bg-slate-400' : 'bg-slate-200'}`}></span> OPTIMASI SONIK
                </button>
                
                <div className={`w-8 h-px bg-slate-200 hidden md:block`}></div>
                
                <button 
                   onClick={() => seoData && setStage(AppStage.SCRIPT_PRODUCTION)}
                   disabled={!seoData}
                   className={`flex items-center gap-2 transition-colors ${
                    stage === AppStage.SCRIPT_PRODUCTION ? 'text-pink-600 font-bold' : ''
                  } ${!seoData ? 'opacity-50 cursor-not-allowed' : 'hover:text-pink-600'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${stage === AppStage.SCRIPT_PRODUCTION ? 'bg-pink-600' : seoData ? 'bg-slate-400' : 'bg-slate-200'}`}></span> LIRIK STUDIO
                </button>
                
                <div className={`w-8 h-px bg-slate-200 hidden md:block`}></div>
                
                <button 
                  onClick={() => songData && setStage(AppStage.PRODUCTION_REPORT)}
                  disabled={!songData}
                  className={`flex items-center gap-2 transition-colors ${
                    stage === AppStage.PRODUCTION_REPORT ? 'text-cyan-600 font-bold' : ''
                  } ${!songData ? 'opacity-50 cursor-not-allowed' : 'hover:text-cyan-600'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${stage === AppStage.PRODUCTION_REPORT ? 'bg-cyan-600' : songData ? 'bg-slate-400' : 'bg-slate-200'}`}></span> FINAL REPORT
                </button>
            </div>

            {stage === AppStage.IDEA_HUB && (
              <IdeaHub 
                onSelectTopic={handleTopicSelect} 
                onLoadProject={handleLoadProject}
                persistentIdeas={generatedIdeas}
                onIdeasUpdate={setGeneratedIdeas}
              />
            )}

            {stage === AppStage.ALGORITHM_SUITE && selectedTopic && (
              <AlgorithmSuite 
                topic={selectedTopic} 
                initialData={seoData}
                onUpdate={setSeoData}
                onComplete={handleAlgorithmComplete} 
              />
            )}

            {stage === AppStage.SCRIPT_PRODUCTION && selectedTopic && (
              <LyricStudio 
                topic={selectedTopic} 
                initialData={songData}
                onUpdate={handleSongUpdate}
                onComplete={handleSongComplete} 
              />
            )}

            {stage === AppStage.PRODUCTION_REPORT && selectedTopic && (
              <ProductionReport 
                topic={selectedTopic} 
                seoData={seoData}
                songData={songData}
                onSaveProject={handleSaveProject}
                onReset={resetApp} 
              />
            )}
          </div>

          {/* Tab 2: Veo Studio */}
          <div className={activeTab === 'veo' ? 'block' : 'hidden'}>
            <VeoStudio />
          </div>

          {/* Tab 3: Thumbnail Studio */}
          <div className={activeTab === 'thumbnail' ? 'block' : 'hidden'}>
            <ThumbnailStudio />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full py-4 bg-white border-t border-slate-200 text-center z-40">
        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
          Sistem Void Music // Integrasi Suno AI & Gemini // Built by Andik Priyanto
        </p>
      </footer>
    </div>
  );
};

export default App;