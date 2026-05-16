export enum ProductionMode {
  GENRE_PURITY = 'Genre Purity',
  CHANNEL_COHESION = 'Channel Cohesion',
  TREND_SPRINTER = 'Trend Sprinter',
}

export interface ChannelProfile {
  channelName: string;
  visualIdentity: string; // e.g., "Futuristic Neon", "Vintage Retro"
  signatureColors: string; // e.g., "Pink and Purple", "Deep Blue and Silver"
  recurringCharacter?: string; // e.g., "A robotic owl", "A girl with headphones"
  aestheticStyle: string; // e.g., "Saturated colors, high contrast", "Minimalist, flat design"
}

export enum SearchTimeframe {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
}

export enum Region {
  GLOBAL = 'Global',
  ASIA = 'Asia',
  AMERICA = 'America',
  EUROPE = 'Europe',
  AFRICA = 'Africa',
  AUSTRALIA = 'Australia',
}

export enum MusicGenre {
  LOFI_CHILL = 'Lofi & Chill',
  ROCK_METAL = 'Rock & Metal',
  POP_EDM = 'Pop & EDM',
  DANGDUT_KOPLO = 'Dangdut & Koplo',
  CAMPURSARI = 'Campursari',
  CULTURE_TRADITIONAL = 'Culture & Traditional',
  HIPHOP_RAP = 'Hiphop & Rap',
  CARRY_ORCHESTRA = 'Cinematic Orchestra',
  RNB_SOUL = 'R&B & Soul',
  JAZZ_BLUES = 'Jazz & Blues',
  COUNTRY_FOLK = 'Country & Folk',
  REGGAE_SKA = 'Reggae & Ska',
  PUNK_EMO = 'Punk & Emo',
  INDIE_ALTERNATIVE = 'Indie & Alternative',
  LATIN_REGGAETON = 'Latin & Reggaeton',
  CLASSICAL_OPERA = 'Classical & Opera',
  PHONK_DRIFT = 'Phonk & Drift',
  TRANCE_TECHNO = 'Trance & Techno',
  HOUSE_DEEP_HOUSE = 'House & Deep House',
  SYNTHWAVE_RETRO = 'Synthwave & Retro',
  KPOP_JPOP = 'K-Pop & J-Pop',
  AFROBEAT_DANCEHALL = 'Afrobeat & Dancehall',
  AMAPIANO_AFRO_TECH = 'Amapiano & Afro-Tech',
  ACOUSTIC_UNPLUGGED = 'Acoustic & Unplugged',
  GOSPEL_SPIRITUAL = 'Gospel & Spiritual',
  FUNK_DISCO = 'Funk & Disco',
}

export enum MusicMood {
  SAD_MELANCHOLIC = 'Sad & Melancholic',
  HAPPY_UPLIFTING = 'Happy & Uplifting',
  DARK_MYSTERIOUS = 'Dark & Mysterious',
  RELAXING_PEACEFUL = 'Relaxing & Peaceful',
  AGGRESSIVE_ENERGETIC = 'Aggressive & Energetic',
  POWERFUL_FEARLESS = 'Powerful & Fearless',
  DOMINANT_DANGEROUS = 'Dominant & Dangerous',
  ADRENALINE_REBELLION = 'Adrenaline & Rebellion',
  NOSTALGIC = 'Nostalgic',
  PEACEFUL_SAFE = 'Peaceful & Emotionally Safe',
  INTROSPECTIVE = 'Introspective',
  COMFORTING = 'Comforting',
  WARM_SENSUAL = 'Warm & Sensual',
  EXPENSIVE = 'Expensive',
  ALIVE_MAGNETIC = 'Alive & Magnetic',
  SOCIAL_ENERGY = 'Social Energy',
  LAID_BACK = 'Laid-back',
  CHILL = 'Chill',
  SOULFUL = 'Soulful',
  CINEMATIC = 'Cinematic',
}

export enum SpatialAudioEffect {
  NONE = 'None',
  EIGHT_D_AUDIO = '8D Audio',
  THREE_D_AUDIO = '3D Audio',
  SPATIAL_MOTION = 'Spatial Motion',
  STEREO_PANNING = 'Stereo Panning',
  ROTATING_SOUND = 'Rotating Sound',
}

export enum CulturalTuning {
  NONE = 'None',
  MAKAM = 'Makam (Middle East / Arab)',
  ORIENTAL = 'Oriental (China / Japan / Korea)',
  RAGA = 'Raga (India)',
  SLENDRO_PELOG = 'Slendro & Pelog (Indonesia)',
  CELTIC = 'Celtic (Irish / Scottish)',
  FLAMENCO = 'Flamenco (Spain)',
  AFRICAN_KORA = 'African Kora & Balafon',
  ANDEAN_FOLK = 'Andean / Pan Pipes',
  NATIVE_AMERICAN = 'Native American Flute',
  PACIFIC_SLACK_KEY = 'Pacific / Polynesian',
  ABORIGINAL_AMBIENT = 'Aboriginal Didgeridoo',
  TIBETAN_MONK = 'Tibetan Monk / Singing Bowl',
  PERSIAN_DASTGAH = 'Persian Dastgah (Iran)',
  BALKAN_BEATS = 'Balkan Brass & Odd Meters',
  KLEZMER = 'Klezmer (Eastern Europe)',
  BLUEGRASS_ROOTS = 'Bluegrass & Appalachian',
  THROAT_SINGING = 'Mongolian Throat Singing',
  THAI_SAI_YAI = 'Thai Classical / Isan',
  ETIO_JAZZ = 'Ethio-Jazz (Pentatonic)',
  CARIBBEAN_CALYPSO = 'Caribbean Steel Drum',
  LATIN_SAMBA_BOSSA = 'Latin Samba & Bossa',
}

export enum EnergyProfile {
  CHILL_TO_HUGE = 'Chill Start -> Huge Drop',
  CONSTANT_HIGH = 'Constant High Energy',
  CONSTANT_LOW = 'Constant Low / Ambient',
  CINEMATIC_BUILD = 'Cinematic Build-up',
  AGGRESSIVE_STACCATO = 'Aggressive & Staccato',
  FLUID_EVOLVING = 'Fluid & Evolving',
}

export enum VocalCharacter {
  NONE = 'None',
  ETHEREAL_AIRY = 'Ethereal & Airy',
  GRAVELLY_GRITTY = 'Gravelly & Gritty',
  AUTOTUNED_ROBOTIC = 'Auto-tuned & Robotic',
  OPERATIC_DRAMATIC = 'Operatic & Dramatic',
  WHISPERED_INTIMATE = 'Whispered & Intimate',
  SOULFUL_POWERFUL = 'Soulful & Powerful',
}

export enum MusicRhythm {
  STEADY_44 = 'Steady 4/4 Beat',
  SYNCOPATED_FUNKY = 'Syncopated & Funky',
  SHUFFLE_SWING = 'Shuffle & Swing',
  TRIPLET_FEEL = 'Triplet Feel',
  HALF_TIME_TRAP = 'Half-time / Trap',
  DOUBLE_TIME = 'Double-time Speed',
  POLYRHYTHMIC = 'Polyrhythmic Layers',
  BROKEN_BEAT = 'Broken Beat / Glitch',
}

export interface SunoConfig {
  style: string;
  lyrics: string;
  title: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export enum MasteringProfile {
  NONE = 'None',
  BASS_BOOSTED = 'Bass Boosted',
  SLOWED_REVERB = 'Slowed + Reverb',
  NIGHTCORE = 'Nightcore (Sped Up)',
  DAYCORE = 'Daycore (Slowed Down)',
  LOFI_VINYL = 'Lo-fi / Vinyl Warmth',
  CLEAN_MASTER = 'Clean & High Fidelity',
  AGGRESSIVE_LIMITER = 'Aggressive Limiter',
}

export enum CustomLeadInstrument {
  NONE = 'None / Auto',
  GAMELAN_SARON = 'Gamelan Saron (Indonesia)',
  ANGKLUNG = 'Angklung (Indonesia)',
  SITAR = 'Sitar (India)',
  PIPA = 'Pipa (China)',
  KOTO = 'Koto (Japan)',
  ERHU = 'Erhu (China)',
  OUD = 'Oud (Middle East)',
  SAZ = 'Saz (Turkey)',
  KORA = 'Kora (West Africa)',
  BALAFON = 'Balafon (West Africa)',
  MARIMBA = 'Marimba (Latin)',
  CHARANGO = 'Charango (Andean)',
  PAN_FLUTE = 'Pan Flute (Andean)',
  BAGPIPES = 'Bagpipes (Scottish)',
  FIDDLE = 'Fiddle (Celtic)',
  DIDGERIDOO = 'Didgeridoo (Australia)',
  MORIN_KHUUR = 'Morin Khuur (Mongolia)',
  SHAKUHACHI = 'Shakuhachi (Japan)',
  KALIMBA = 'Kalimba (Africa)',
}

export interface Topic {
  title: string;
  genre: MusicGenre;
  mood: MusicMood;
  issueContext?: string;
  viralLogic: string;
  predictedCTR: number;
  visualPotential: string;
  tempo?: string;
  sources?: GroundingSource[];
  spatialAudio?: SpatialAudioEffect;
  isInstrumental?: boolean;
  culturalTuning?: CulturalTuning;
  customRegion?: string;
  energyProfile?: EnergyProfile;
  vocalCharacter?: VocalCharacter;
  targetBpm?: number;
  culturalIntensity?: number;
  rhythm?: MusicRhythm;
  masteringProfile?: MasteringProfile;
  customLeadInstrument?: CustomLeadInstrument;
  customLeadIntensity?: number;
}

export interface SEOPackage {
  titleVariants: {
    searchFocused: string[];
    emotionalClickbait: string[];
    shortForm: string[];
  };
  sunoStyle: string;
  thumbnailPrompts: string[];
  description: string;
  tags: string[];
  hashtags: string[];
  pinnedComment: string;
}

export interface SongStudioData {
  lyrics: string;
  productionDescription: string;
  visualizerPrompt: string;
  unifiedSunoPrompt: string;
}

export interface SavedProject {
  id: string;
  createdAt: number;
  lastModified: string;
  topic: Topic;
  seoData: SEOPackage | null;
  songData: SongStudioData | null;
  contextIdeas?: Topic[]; 
}

export enum AppStage {
  IDEA_HUB = 'IDEA_HUB',
  CUSTOMIZATION = 'CUSTOMIZATION',
  ALGORITHM_SUITE = 'ALGORITHM_SUITE',
  SCRIPT_PRODUCTION = 'SCRIPT_PRODUCTION',
  PRODUCTION_REPORT = 'PRODUCTION_REPORT',
}