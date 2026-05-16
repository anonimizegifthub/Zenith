import React, { useState } from 'react';
import { Topic, SpatialAudioEffect, CulturalTuning, EnergyProfile, VocalCharacter, MusicMood, MusicRhythm, MusicGenre, MasteringProfile, CustomLeadInstrument } from '../types';
import { Button } from './ui/Button';
import { Zap, Music, Globe, ArrowRight, SkipForward, Activity, Mic2, Gauge, Smile, Layers, Sliders } from 'lucide-react';

interface CustomizationStudioProps {
  topic: Topic;
  onUpdate: (updatedTopic: Topic) => void;
  onComplete: (updatedTopic: Topic) => void;
}

export const CustomizationStudio: React.FC<CustomizationStudioProps> = ({
  topic,
  onUpdate,
  onComplete
}) => {
  const [spatialAudio, setSpatialAudio] = useState<SpatialAudioEffect>(topic.spatialAudio || SpatialAudioEffect.NONE);
  const [culturalTuning, setCulturalTuning] = useState<CulturalTuning>(topic.culturalTuning || CulturalTuning.NONE);
  const [energyProfile, setEnergyProfile] = useState<EnergyProfile>(topic.energyProfile || EnergyProfile.CHILL_TO_HUGE);
  const [vocalCharacter, setVocalCharacter] = useState<VocalCharacter>(topic.vocalCharacter || VocalCharacter.NONE);
  const [targetBpm, setTargetBpm] = useState<number>(topic.targetBpm || 128);
  const [culturalIntensity, setCulturalIntensity] = useState<number>(topic.culturalIntensity || 50);
  const [mood, setMood] = useState<MusicMood>(topic.mood || MusicMood.HAPPY_UPLIFTING);
  const [rhythm, setRhythm] = useState<MusicRhythm>(topic.rhythm || MusicRhythm.STEADY_44);
  const [masteringProfile, setMasteringProfile] = useState<MasteringProfile>(topic.masteringProfile || MasteringProfile.NONE);
  const [customLeadInstrument, setCustomLeadInstrument] = useState<CustomLeadInstrument>(topic.customLeadInstrument || CustomLeadInstrument.NONE);
  const [customLeadIntensity, setCustomLeadIntensity] = useState<number>(topic.customLeadIntensity || 50);

  const handleUpdate = (updates: Partial<Topic>) => {
    const updated = { ...topic, ...updates };
    onUpdate(updated);
  };

  const handleSpatialChange = (effect: SpatialAudioEffect) => {
    setSpatialAudio(effect);
    handleUpdate({ spatialAudio: effect });
  };

  const handleTuningChange = (tuning: CulturalTuning) => {
    setCulturalTuning(tuning);
    handleUpdate({ culturalTuning: tuning });
  };

  const handleEnergyChange = (profile: EnergyProfile) => {
    setEnergyProfile(profile);
    handleUpdate({ energyProfile: profile });
  };

  const handleVocalChange = (vocal: VocalCharacter) => {
    setVocalCharacter(vocal);
    handleUpdate({ vocalCharacter: vocal });
  };

  const handleMoodChange = (newMood: MusicMood) => {
    setMood(newMood);
    handleUpdate({ mood: newMood });
  };
  
  const handleRhythmChange = (newRhythm: MusicRhythm) => {
    setRhythm(newRhythm);
    handleUpdate({ rhythm: newRhythm });
  };

  const handleMasteringChange = (profile: MasteringProfile) => {
    setMasteringProfile(profile);
    handleUpdate({ masteringProfile: profile });
  };

  const handleLeadInstrumentChange = (instrument: CustomLeadInstrument) => {
    setCustomLeadInstrument(instrument);
    handleUpdate({ customLeadInstrument: instrument });
  };

  const handleLeadIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const intensity = parseInt(e.target.value);
    setCustomLeadIntensity(intensity);
    handleUpdate({ customLeadIntensity: intensity });
  };

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bpm = parseInt(e.target.value);
    setTargetBpm(bpm);
    handleUpdate({ targetBpm: bpm });
  };

  const handleIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const intensity = parseInt(e.target.value);
    setCulturalIntensity(intensity);
    handleUpdate({ culturalIntensity: intensity });
  };

  const handleReset = () => {
    const defaultCustomization = {
      spatialAudio: SpatialAudioEffect.NONE,
      culturalTuning: CulturalTuning.NONE,
      energyProfile: topic.energyProfile || EnergyProfile.CHILL_TO_HUGE,
      vocalCharacter: VocalCharacter.NONE,
      targetBpm: topic.targetBpm || 128, // Use AI recommendation if available
      culturalIntensity: 50,
      mood: topic.mood || MusicMood.HAPPY_UPLIFTING,
      rhythm: topic.rhythm || MusicRhythm.STEADY_44,
      masteringProfile: MasteringProfile.NONE,
      customLeadInstrument: CustomLeadInstrument.NONE,
      customLeadIntensity: 50
    };
    
    setSpatialAudio(defaultCustomization.spatialAudio);
    setCulturalTuning(defaultCustomization.culturalTuning);
    setEnergyProfile(defaultCustomization.energyProfile);
    setVocalCharacter(defaultCustomization.vocalCharacter);
    setTargetBpm(defaultCustomization.targetBpm);
    setCulturalIntensity(defaultCustomization.culturalIntensity);
    setMood(defaultCustomization.mood);
    setRhythm(defaultCustomization.rhythm);
    setMasteringProfile(defaultCustomization.masteringProfile);
    setCustomLeadInstrument(defaultCustomization.customLeadInstrument);
    setCustomLeadIntensity(defaultCustomization.customLeadIntensity);
    
    onUpdate({ ...topic, ...defaultCustomization });
  };

  const finalize = () => {
    onComplete({ 
      ...topic, 
      spatialAudio, 
      culturalTuning,
      energyProfile,
      vocalCharacter,
      targetBpm,
      culturalIntensity,
      mood,
      rhythm,
      masteringProfile,
      customLeadInstrument,
      customLeadIntensity
    });
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-5xl mx-auto pb-20">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-mono text-indigo-600 flex items-center justify-center gap-2">
          <Zap className="w-6 h-6" />
          MODUL 2: SONIC CUSTOMIZATION STUDIO
        </h2>
        <p className="text-slate-500 text-sm mt-2">Fine-tune the architectural DNA of your music before production.</p>
        <div className="mt-4 inline-block px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Refining track</span>
          <span className="text-slate-700 font-bold">{topic.title}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {/* Column 1: Core Identity & Dynamics */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <label className="text-xs font-mono text-indigo-600 uppercase flex items-center gap-2 mb-4">
              <Music className="w-4 h-4" /> Mode Production
            </label>
            <div className={`w-full px-4 py-4 rounded-lg border transition-all flex items-center justify-between ${
              topic.isInstrumental 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                : 'bg-slate-50 border-slate-100 text-slate-600'
            }`}>
              <div className="flex flex-col items-start">
                <span className="font-bold uppercase text-xs">{topic.isInstrumental ? 'Instrumental Only' : 'Vocal & Instrumental'}</span>
                <span className="text-[10px] opacity-70">Ditentukan di Modul Ideasi</span>
              </div>
              <Zap className="w-4 h-4 opacity-50" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <label className="text-xs font-mono text-orange-600 uppercase flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4" /> Energy & Dynamic Flow
            </label>
            <div className="space-y-2">
              {Object.values(EnergyProfile).map((profile) => (
                <button
                  key={profile}
                  onClick={() => handleEnergyChange(profile)}
                  className={`w-full px-3 py-2 text-left text-xs font-mono rounded border transition-all relative overflow-hidden ${
                    energyProfile === profile 
                      ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm' 
                      : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <span className="pr-2">{profile}</span>
                    {topic.energyProfile === profile && (
                      <span className="text-[8px] bg-orange-200 text-orange-700 px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap">
                        ✨ AI PICK
                      </span>
                    )}
                  </div>
                  {topic.energyProfile === profile && (
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-100/20 to-transparent animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <label className="text-xs font-mono text-slate-600 uppercase flex items-center gap-2 mb-4">
              <Gauge className="w-4 h-4" /> Beats Per Minute (BPM)
            </label>
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-3xl font-mono font-bold text-slate-800">{targetBpm}</span>
                <span className="text-xs text-slate-400 ml-2">BPM</span>
                {topic.targetBpm === targetBpm && (
                  <div className="text-[9px] text-indigo-500 font-mono mt-1 font-bold animate-pulse">
                    ✨ AI RECOMMENDED TEMPO
                  </div>
                )}
              </div>
              <input 
                type="range" 
                min="60" 
                max="200" 
                value={targetBpm} 
                onChange={handleBpmChange}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>SLOW (60)</span>
                <span>FAST (200)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Musical Character & Rhythm */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <label className="text-xs font-mono text-cyan-600 uppercase flex items-center gap-2 mb-4">
              <Smile className="w-4 h-4" /> Mood Selector
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
              {Object.values(MusicMood).map((m) => (
                <button
                  key={m}
                  onClick={() => handleMoodChange(m)}
                  className={`px-3 py-2 text-left text-[10px] font-mono rounded border transition-all relative overflow-hidden ${
                    mood === m 
                      ? 'bg-cyan-50 border-cyan-500 text-cyan-700 shadow-sm' 
                      : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <span className="truncate pr-2">{m}</span>
                    {topic.mood === m && (
                      <span className="text-[7px] bg-cyan-100 text-cyan-600 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">✨ AI PICK</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <label className="text-xs font-mono text-blue-600 uppercase flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4" /> Music Rhythm
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
              {Object.values(MusicRhythm).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRhythmChange(r)}
                  className={`w-full px-3 py-2 text-left text-[10px] font-mono rounded border transition-all relative overflow-hidden ${
                    rhythm === r 
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                      : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                  }`}
                >
                   <div className="flex justify-between items-center relative z-10">
                    <span className="pr-2">{r}</span>
                    {topic.rhythm === r && (
                      <span className="text-[8px] bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap">
                        ✨ AI PICK
                      </span>
                    )}
                  </div>
                  {topic.rhythm === r && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-transparent animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {!topic.isInstrumental && (
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-fade-in">
              <label className="text-xs font-mono text-pink-600 uppercase flex items-center gap-2 mb-4">
                <Mic2 className="w-4 h-4" /> Vocal Character
              </label>
              <div className="grid grid-cols-1 gap-2">
                {Object.values(VocalCharacter).map((vocal) => (
                  <button
                    key={vocal}
                    onClick={() => handleVocalChange(vocal)}
                    className={`px-3 py-2 text-left text-xs font-mono rounded border transition-all ${
                      vocalCharacter === vocal 
                        ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-sm' 
                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {vocal}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <label className="text-xs font-mono text-purple-600 uppercase flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4" /> Spatial Audio Effect
            </label>
            <div className="grid grid-cols-1 gap-2">
              {Object.values(SpatialAudioEffect).map((effect) => (
                <button
                  key={effect}
                  onClick={() => handleSpatialChange(effect)}
                  className={`px-4 py-2 text-left text-xs font-mono rounded border transition-all flex items-center justify-between ${
                    spatialAudio === effect 
                      ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm' 
                      : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span className="pr-2">{effect}</span>
                  {spatialAudio === effect && <div className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Sonic Sculpting & Global Tuning */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <label className="text-xs font-mono text-emerald-600 uppercase flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4" /> Cultural & Musical Tuning
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar mb-6">
              {Object.values(CulturalTuning).map((tuning) => (
                <button
                  key={tuning}
                  onClick={() => handleTuningChange(tuning)}
                  className={`px-4 py-2 text-left text-[10px] font-mono rounded border transition-all flex items-center justify-between ${
                    culturalTuning === tuning 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' 
                      : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span className="pr-2 leading-tight">{tuning}</span>
                  {culturalTuning === tuning && <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />}
                </button>
              ))}
            </div>

            {culturalTuning !== CulturalTuning.NONE && (
              <div className="space-y-4 animate-fade-in pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono text-emerald-600 uppercase">Influence Intensity</label>
                  <span className="text-xs font-mono font-bold text-emerald-700">{culturalIntensity}%</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={culturalIntensity} 
                  onChange={handleIntensityChange}
                  className="w-full h-1.5 bg-emerald-50 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                  <span>SUBTLE</span>
                  <span>DOMINANT</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <label className="text-xs font-mono text-amber-600 uppercase flex items-center gap-2 mb-4">
              <Sliders className="w-4 h-4" /> Mastering & Sound Profile
            </label>
            <div className="grid grid-cols-1 gap-2">
              {Object.values(MasteringProfile).map((profile) => (
                <button
                  key={profile}
                  onClick={() => handleMasteringChange(profile)}
                  className={`px-4 py-2 text-left text-[10px] font-mono rounded border transition-all flex items-center justify-between ${
                    masteringProfile === profile 
                      ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm' 
                      : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span className="pr-2 leading-tight">{profile}</span>
                  {masteringProfile === profile && <div className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />}
                </button>
              ))}
            </div>
            {masteringProfile !== MasteringProfile.NONE && (
              <p className="mt-3 text-[9px] text-amber-600 italic leading-relaxed">
                Applied profile affects the final sonic texture and loudness.
              </p>
            )}
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <label className="text-xs font-mono text-rose-600 uppercase flex items-center gap-2 mb-4">
              <Music className="w-4 h-4" /> Custom Lead Instrument
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
              {Object.values(CustomLeadInstrument).map((instrument) => (
                <button
                  key={instrument}
                  onClick={() => handleLeadInstrumentChange(instrument)}
                  className={`px-4 py-2 text-left text-[10px] font-mono rounded border transition-all flex items-center justify-between ${
                    customLeadInstrument === instrument 
                      ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm' 
                      : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span className="pr-2 leading-tight">{instrument}</span>
                  {customLeadInstrument === instrument && <div className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />}
                </button>
              ))}
            </div>
            {customLeadInstrument !== CustomLeadInstrument.NONE && (
              <p className="mt-3 text-[9px] text-rose-600 italic leading-relaxed">
                * Prioritizing {customLeadInstrument} for lead melodies.
              </p>
            )}

            {customLeadInstrument !== CustomLeadInstrument.NONE && (
              <div className="space-y-4 animate-fade-in pt-4 border-t border-slate-100 mt-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono text-rose-600 uppercase">Influence Intensity</label>
                  <span className="text-xs font-mono font-bold text-rose-700">{customLeadIntensity}%</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={customLeadIntensity} 
                  onChange={handleLeadIntensityChange}
                  className="w-full h-1.5 bg-rose-50 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
                <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                  <span>SUBTLE GUEST</span>
                  <span>CONSTANT LEAD</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-slate-100 bg-white/80 backdrop-blur sticky bottom-0 p-4 rounded-t-2xl z-10">
        <div className="flex gap-4">
          <Button 
            onClick={finalize} 
            variant="secondary"
            className="text-slate-400 hover:text-slate-600"
          >
            <SkipForward className="w-4 h-4" /> SKIP CUSTOMIZATION
          </Button>
          <Button 
            onClick={handleReset} 
            variant="outline"
            className="text-slate-500 border-slate-200 hover:bg-slate-50"
          >
            <Activity className="w-4 h-4" /> RESET TO AUTOMATIC
          </Button>
        </div>
        <Button 
          onClick={finalize} 
          variant="primary"
          className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 px-12 h-12"
        >
          FINALIZE ARCHITECTURE <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
