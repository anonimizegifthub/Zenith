export enum ProductionMode {
  GENRE_PURITY = 'Genre Purity',
  CHANNEL_COHESION = 'Channel Cohesion',
  TREND_SPRINTER = 'Trend Sprinter',
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
}

export enum MusicMood {
  SAD_MELANCHOLIC = 'Sad & Melancholic',
  HAPPY_UPLIFTING = 'Happy & Uplifting',
  DARK_MYSTERIOUS = 'Dark & Mysterious',
  RELAXING_PEACEFUL = 'Relaxing & Peaceful',
  AGGRESSIVE_ENERGETIC = 'Aggressive & Energetic',
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

export interface Topic {
  title: string;
  genre: MusicGenre;
  mood: MusicMood;
  viralLogic: string;
  predictedCTR: number;
  visualPotential: string;
  tempo?: string;
  sources?: GroundingSource[];
}

export interface SEOPackage {
  titleVariants: {
    searchFocused: string;
    emotionalClickbait: string;
    shortForm: string;
  };
  sunoStyle: string;
  thumbnailPrompts: string[];
  thumbnailText: {
    text: string;
    description: string;
  }[];
  description: string;
  tags: string[];
  hashtags: string[];
  pinnedComment: string;
}

export interface SongStudioData {
  lyrics: string;
  productionDescription: string;
  visualizerPrompt: string;
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
  ALGORITHM_SUITE = 'ALGORITHM_SUITE',
  SCRIPT_PRODUCTION = 'SCRIPT_PRODUCTION',
  PRODUCTION_REPORT = 'PRODUCTION_REPORT',
}