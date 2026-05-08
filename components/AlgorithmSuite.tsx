import React, { useEffect, useState } from 'react';
import { generateAlgorithmSuite } from '../services/geminiService';
import { Topic, SEOPackage } from '../types';
import { Button } from './ui/Button';
import { LoadingBar } from './ui/LoadingBar';
import { Search, Image, Hash, MessageSquare, ArrowRight, Copy, Check, Type, Zap } from 'lucide-react';

interface AlgorithmSuiteProps {
  topic: Topic;
  initialData?: SEOPackage | null;
  onUpdate?: (data: SEOPackage) => void;
  onComplete: (data: SEOPackage) => void;
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="p-1.5 hover:bg-pink-100 rounded-md transition-colors text-slate-400 hover:text-pink-600 ml-2 shrink-0"
      title="Salin ke clipboard"
    >
      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
    </button>
  );
};

export const AlgorithmSuite: React.FC<AlgorithmSuiteProps> = ({ topic, initialData, onUpdate, onComplete }) => {
  const [data, setData] = useState<SEOPackage | null>(initialData || null);
  const [loading, setLoading] = useState(false);
  const [lastProcessedTopic, setLastProcessedTopic] = useState<string | null>(initialData ? topic.title : null);

  useEffect(() => {
    // If we have initial data AND it matches the current topic (or we just loaded it), use it.
    if (initialData && !data) {
      setData(initialData);
      setLastProcessedTopic(topic.title);
      return;
    }

    // Only fetch if no data exists OR the topic has changed
    if (topic.title !== lastProcessedTopic) {
      setData(null);
      
      const fetchData = async () => {
        setLoading(true);
        try {
          const result = await generateAlgorithmSuite(topic.title);
          setData(result);
          setLastProcessedTopic(topic.title);
          if (onUpdate) onUpdate(result);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [topic.title, initialData, lastProcessedTopic, data, onUpdate]);

  if (loading || !data) {
    return (
      <LoadingBar 
        text="MENGHITUNG VEKTOR ALGORITMA..." 
        subtext="MENGOPTIMALKAN METADATA UNTUK RETENSI MAKSIMUM..." 
      />
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-pink-100 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-mono text-pink-600 flex items-center gap-2">
            <Search className="w-6 h-6" />
            MODUL 2: MUSIK ALGORITMA SUITE
          </h2>
          <p className="text-slate-500 text-sm mt-1">Lagu: {topic.title}</p>
        </div>
        <Button onClick={() => onComplete(data)} className="bg-pink-600 hover:bg-pink-700">
          LANJUT KE LIRIK <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Suno Prompt Box */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 p-6 rounded-lg relative overflow-hidden group shadow-sm">
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
           <Zap className="w-24 h-24 text-pink-200" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-pink-600 font-mono text-xs mb-3 uppercase tracking-widest">
            <Zap className="w-4 h-4" /> Suno AI Style Prompt
          </div>
          <div className="flex items-center justify-between gap-4 bg-white/60 backdrop-blur-sm p-4 rounded border border-pink-100">
             <div className="text-xl font-bold text-slate-900 font-mono tracking-tight italic">
               {data.sunoStyle}
             </div>
             <CopyButton text={data.sunoStyle} />
          </div>
          <p className="mt-3 text-[10px] text-slate-500 font-mono italic">
            *Salin prompt ini ke kolom "Style of Music" di Suno AI untuk hasil instrumen maksimal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Titles Section */}
        <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-pink-600">01</span> VARIASI JUDUL LAGU
          </h3>
          <div className="space-y-4">
            <div className="group">
              <span className="text-xs font-mono text-slate-500 uppercase">Fokus Pencarian</span>
              <div className="flex items-center justify-between">
                <div className="text-green-700 font-bold text-lg">{data.titleVariants.searchFocused}</div>
                <CopyButton text={data.titleVariants.searchFocused} />
              </div>
            </div>
            <div className="group">
              <span className="text-xs font-mono text-slate-500 uppercase">Emosional / Clickbait</span>
              <div className="flex items-center justify-between">
                <div className="text-orange-700 font-bold text-lg">{data.titleVariants.emotionalClickbait}</div>
                <CopyButton text={data.titleVariants.emotionalClickbait} />
              </div>
            </div>
            <div className="group">
              <span className="text-xs font-mono text-slate-500 uppercase">Durasi Pendek (Shorts)</span>
              <div className="flex items-center justify-between">
                <div className="text-purple-700 font-bold text-lg">{data.titleVariants.shortForm}</div>
                <CopyButton text={data.titleVariants.shortForm} />
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnails */}
        <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-pink-600">02</span> COVER ART ENGINE
            <Image className="w-4 h-4 text-slate-400" />
          </h3>
          
          <div className="space-y-6">
            {/* Visual Prompts */}
            <div>
              <span className="text-xs font-mono text-slate-500 uppercase block mb-2 flex items-center gap-2">
                 <Image className="w-3 h-3" /> Prompts Sampul Lagu
              </span>
              <div className="space-y-3">
                {data.thumbnailPrompts.map((prompt, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded border border-slate-200 text-sm text-slate-700 flex justify-between items-start gap-2 shadow-sm">
                    <span className="italic">"{prompt}"</span>
                    <CopyButton text={prompt} />
                  </div>
                ))}
              </div>
            </div>

            {/* Text Overlays */}
            <div>
              <span className="text-xs font-mono text-slate-500 uppercase block mb-2 flex items-center gap-2">
                 <Type className="w-3 h-3" /> Rekomendasi Teks Overlay (Main + Sub)
              </span>
              <div className="grid grid-cols-1 gap-3">
                {data.thumbnailText && data.thumbnailText.length > 0 ? (
                  data.thumbnailText.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded border border-slate-200 flex flex-col gap-1 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-yellow-700 font-sans tracking-tight">{item.text}</span>
                        <CopyButton text={item.text} />
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-200 pt-2 mt-1">
                        <p className="text-xs text-slate-600 font-medium font-sans">
                          {item.description}
                        </p>
                        <CopyButton text={item.description} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 italic px-2">Data teks tidak tersedia untuk entri lama.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="text-pink-600">03</span> OPTIMASI DISTRIBUSI (SEO)
          <Hash className="w-4 h-4 text-slate-400" />
        </h3>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-slate-500 uppercase block">Deskripsi</label>
              <CopyButton text={data.description} />
            </div>
            <div className="bg-slate-50 p-4 rounded text-slate-700 text-sm whitespace-pre-wrap font-sans border border-slate-100 shadow-inner">
              {data.description}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-slate-500 uppercase block">Tags</label>
                <CopyButton text={data.tags.join(', ')} />
              </div>
              <div className="flex flex-wrap gap-2">
                {data.tags.map((tag, i) => (
                  <span key={i} className="bg-slate-100 text-cyan-800 px-2 py-1 rounded text-xs border border-slate-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div>
               <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-slate-500 uppercase block">Hashtags</label>
                <CopyButton text={data.hashtags.join(' ')} />
              </div>
              <div className="flex flex-wrap gap-2">
                {data.hashtags.map((tag, i) => (
                  <span key={i} className="text-blue-600 text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement */}
      <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="text-pink-600">04</span> ANTARMUKA KOMUNITAS
          <MessageSquare className="w-4 h-4 text-slate-400" />
        </h3>
        <div className="bg-slate-50 p-4 rounded border-l-4 border-pink-600 shadow-sm">
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs font-mono text-pink-600 block font-bold">PINNED COMMENT</span>
            <CopyButton text={data.pinnedComment} />
          </div>
          <p className="text-slate-800 font-medium">"{data.pinnedComment}"</p>
        </div>
      </div>
    </div>
  );
};