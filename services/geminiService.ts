import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { Topic, SEOPackage, SongStudioData, Region, MusicGenre, MusicMood, GroundingSource, ProductionMode, ChannelProfile, SearchTimeframe, SpatialAudioEffect, CulturalTuning, EnergyProfile, VocalCharacter, MusicRhythm, CustomLeadInstrument } from '../types';

const getAPIKey = (customKey?: string) => {
  // Priority: 1. Manual function argument, 2. Local Storage (User Input), 3. Environment Variables
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('user_gemini_api_key') : null;
  
  return customKey || 
    localKey ||
    process.env.GEMINI_API_KEY || 
    process.env.API_KEY || 
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (window as any).GEMINI_API_KEY ||
    '';
};

const getAI = (customKey?: string) => {
  const keyToUse = getAPIKey(customKey);
    
  if (!keyToUse) {
    console.error("Gemini API Key missing!");
    throw new Error("API KEY TIDAK DITEMUKAN. Silakan atur GEMINI_API_KEY di Vercel/Environment Variables Anda lalu lakukan Deploy ulang (Re-build).");
  }
  
  // Debug log (masked)
  const masked = keyToUse.substring(0, 4) + "..." + keyToUse.substring(keyToUse.length - 4);
  console.log(`Using API Key starting with: ${masked}`);

  return new GoogleGenAI({ apiKey: keyToUse });
};

const modelId = 'gemini-3-flash-preview';

// Fallback model if the experimental one is restricted
const getModelId = () => modelId;

/**
 * Handle Gemini API Errors gracefully, focusing on Quota and Auth issues.
 */
const handleGeminiError = (error: any, context: string) => {
  console.error(`${context} API Error:`, error);
  
  const status = error?.status || error?.error?.status;
  const message = error?.message || error?.error?.message || "";

  if (status === "RESOURCE_EXHAUSTED" || message.includes("quota")) {
    throw new Error("QUOTA GEMINI HABIS (429): Batas penggunaan API gratis Anda telah tercapai. Tunggu beberapa saat atau gunakan API Key kustom Anda di menu Settings (Neural Override).");
  }

  if (status === "UNAUTHENTICATED" || message.includes("API key not valid")) {
    throw new Error("API KEY TIDAK VALID: Mohon periksa kembali API Key Anda di menu Settings.");
  }

  if (message.includes("fetch")) {
    throw new Error("KESALAHAN JARINGAN: Gagal menghubungi server neural core. Periksa koneksi internet Anda.");
  }

  throw new Error(message || `Kegagalan sistem pada jalur ${context}.`);
};

// Helper to reliably parse JSON from Gemini response
const parseGeminiResponse = (response: any) => {
  if (!response?.candidates?.[0]) return null;
  
  const candidate = response.candidates[0];
  
  // Check for safety blocks or errors
  if (candidate.finishReason && candidate.finishReason !== 'FINISH_REASON_UNSPECIFIED' && candidate.finishReason !== 'STOP') {
    console.error("Gemini Finish Reason:", candidate.finishReason);
    if (candidate.finishReason === 'SAFETY') {
      throw new Error("Konten diblokir oleh filter keamanan (Safety Filter). Silakan coba topik lain.");
    }
  }

  try {
    // 1. Try built-in parsed property if available
    if (response.parsed) {
      return response.parsed;
    }
  } catch (e) {
    console.warn("SDK parsing failed, falling back to manual parsing");
  }

  try {
    // 2. Manual parsing of response.text
    const textStr = response.text || "";
    if (!textStr) {
       console.warn("Empty response text");
       return null;
    }
    
    // Remove markdown code blocks if present
    const cleanText = textStr.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/```$/, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini JSON Parse Error:", error);
    console.log("Raw Response:", response);
    return null;
  }
};

export const generateIdeas = async (
  region: Region = Region.GLOBAL, 
  categories: MusicGenre[] = [], 
  useSearch: boolean = false,
  mode: ProductionMode = ProductionMode.GENRE_PURITY,
  profile?: ChannelProfile,
  moods: MusicMood[] = [],
  timeframe: SearchTimeframe = SearchTimeframe.WEEKLY,
  spatialAudio: SpatialAudioEffect = SpatialAudioEffect.NONE,
  isInstrumental: boolean = false,
  customRegion?: string
): Promise<Topic[]> => {
  try {
    const ai = getAI();
    const targetRegion = customRegion || region;
    const categoryList = categories.length > 0 ? categories.join(", ") : "Semua Genre Musik Populer";
    const moodList = moods.length > 0 ? moods.join(", ") : "Semua Mood";
    
    const instrumentalContext = isInstrumental 
      ? "\n      INSTRUMENTAL MODE ENABLED: The music should be purely instrumental (backings, beats, orchestral) without any human vocals or lyrics. Focus on complex arrangements and leading instruments." 
      : "";

    const profileContext = profile 
      ? `CHANNEL BRANDING: This music is for "${profile.channelName}". 
         Visual ID: ${profile.visualIdentity}.
         Recurring Elements: ${profile.recurringCharacter || 'None'}.
         Style/Mood: ${profile.aestheticStyle}.`
      : "";

    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            issueContext: { type: Type.STRING },
            viralLogic: { type: Type.STRING },
            predictedCTR: { type: Type.NUMBER },
            visualPotential: { type: Type.STRING },
            genre: { type: Type.STRING, enum: Object.values(MusicGenre) },
            mood: { type: Type.STRING, enum: Object.values(MusicMood) },
            targetBpm: { type: Type.NUMBER, description: "A recommended tempo for this genre/mood, between 60 and 200." },
            energyProfile: { type: Type.STRING, enum: Object.values(EnergyProfile) },
            rhythm: { type: Type.STRING, enum: Object.values(MusicRhythm) },
          },
          required: ["title", "issueContext", "viralLogic", "predictedCTR", "visualPotential", "genre", "mood", "targetBpm", "energyProfile", "rhythm"]
        }
      }
    };

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: getModelId(),
      contents: `Initialize MODULE 1: THE MUSIC IDEA HUB. 
      CURRENT DATE: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
      Target Region: ${targetRegion}
      Target Timeframe: ${timeframe}
      Target Genres: ${categoryList}
      Target Moods: ${moodList}
      Production Mode: ${mode}
      
      GENRE-MOOD RECOMMENDATION (CRITICAL):
      - If Genre is "Amapiano & Afro-Tech", prioritize moods: "Laid-back", "Chill", or "Soulful".
      - If Genre is "Phonk & Drift", prioritize moods: "Cinematic" or "Dark & Mysterious".
      
      ${instrumentalContext}
      ${profileContext}
      ${useSearch ? `REAL-TIME NEURAL SEARCH ENABLED: Access current TikTok Billboard, Spotify Charts, and Music Industry News. IMPORTANT: You MUST actively use the googleSearch tool to find trending music-related topics (e.g. artist feuds, viral music gear, genre shifts, concert controversies, or viral cover trends) within the last ${timeframe.toLowerCase()}. While general world news is allowed, PRIORITIZE issues specifically within the MUSIC WORLD as they correlate better with channel growth.` : ""}

      Suggest 5 viral song concepts that are highly relevant to ${targetRegion} but have global appeal.
      
      REQUIREMENTS:
      1. COVERAGE: Explore deep into ${categoryList}. 
      2. BRAND CONSISTENCY: Align themes with the provided Channel Profile Branding.
      3. TONE & MODE: "Sonic Architecture" with focal point on ${mode}.
         - If Genre Purity: focus on highly consistent, polished execution of the specific genre.
         - If Channel Cohesion: focus on concepts that build a strong, recognizable brand identity across these 5 tracks.
         - If Trend Sprinter: prioritize high-speed virality and current meme/trend synergy.
      4. CATCHINESS: Focus on concepts with deep hooks and consistent atmosphere.
      5. ISSUE CONTEXT (CRITICAL): In the 'issueContext' field, explicitly state the music-related trend, artist news, or viral soundscape that inspired this. Ensure the text is written in English. Priority: Music Industry > General Pop Culture > General News.`,
      config: config
    });

    const parsed = parseGeminiResponse(response);
    if (!parsed) {
        throw new Error("Neural core mengembalikan data kosong atau tidak valid.");
    }

    // Extract grounding sources if available
    const sources: GroundingSource[] = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    const topics = (parsed || []) as Topic[];
    if (Array.isArray(topics)) {
      topics.forEach(t => {
        if (t) {
          if (sources.length > 0) t.sources = sources;
          if (spatialAudio !== SpatialAudioEffect.NONE) t.spatialAudio = spatialAudio;
          if (isInstrumental) t.isInstrumental = true;
          if (customRegion) t.customRegion = customRegion;
          if (!customRegion && region !== Region.GLOBAL) t.customRegion = region;
        }
      });
    }

    return topics;
  } catch (error: any) {
    return handleGeminiError(error, "generateIdeas");
  }
};

export const optimizeManualTopic = async (
  rawInput: string, 
  useSearch: boolean = false, 
  spatialAudio: SpatialAudioEffect = SpatialAudioEffect.NONE, 
  isInstrumental: boolean = false
): Promise<Topic | null> => {
  try {
    const ai = getAI();
    
    const instrumentalContext = isInstrumental 
      ? "\n      INSTRUMENTAL MODE ENABLED: This is an instrumental song. No lyrics should be generated, and the metadata should reflect its non-vocal nature." 
      : "";

    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          issueContext: { type: Type.STRING },
          viralLogic: { type: Type.STRING },
          predictedCTR: { type: Type.NUMBER },
          visualPotential: { type: Type.STRING },
        },
        required: ["title", "issueContext", "viralLogic", "predictedCTR", "visualPotential"]
      }
    };

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: getModelId(),
      contents: `Initialize MODULE 1: MANUAL MUSIC INPUT. 
      User Input: "${rawInput}".
      
      GENRE-MOOD RECOMMENDATION (CRITICAL):
      - If Genre is "Amapiano & Afro-Tech", prioritize moods: "Laid-back", "Chill", or "Soulful".
      - If Genre is "Phonk & Drift", prioritize moods: "Cinematic" or "Dark & Mysterious".
      
      ${instrumentalContext}
      ${useSearch ? "REAL-TIME SEARCH ENABLED: Access current music trends and industry news. Prioritize music-related controversies or viral sounds." : ""}
      
      Task:
      1. Analyze the user request for a song. 
      2. OPTIMIZE the phrasing to be a viral song title.
      3. Generate the genre, mood, issueContext (CRITICAL: Be explicit about the music-related trend or viral sound that inspired this if Neural search was enabled), viral logic, predicted catchy-rate, targetBpm (between 60-200), and visual potential. Priority: Music/Artist News > General Trends.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            issueContext: { type: Type.STRING },
            viralLogic: { type: Type.STRING },
            predictedCTR: { type: Type.NUMBER },
            visualPotential: { type: Type.STRING },
            genre: { type: Type.STRING, enum: Object.values(MusicGenre) },
            mood: { type: Type.STRING, enum: Object.values(MusicMood) },
            targetBpm: { type: Type.NUMBER },
            energyProfile: { type: Type.STRING, enum: Object.values(EnergyProfile) },
            rhythm: { type: Type.STRING, enum: Object.values(MusicRhythm) },
          },
          required: ["title", "issueContext", "viralLogic", "predictedCTR", "visualPotential", "genre", "mood", "targetBpm", "energyProfile", "rhythm"]
        }
      }
    });

    const parsed = parseGeminiResponse(response) as any;
    if (!parsed) return null;

    // Extract grounding sources
    const sources: GroundingSource[] = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    if (sources.length > 0) {
      parsed.sources = sources;
    }
    
    if (spatialAudio !== SpatialAudioEffect.NONE) {
      parsed.spatialAudio = spatialAudio;
    }

    if (isInstrumental) {
      parsed.isInstrumental = true;
    }

    return parsed as Topic;
  } catch (error) {
    console.error("optimizeManualTopic API Error:", error);
    return null;
  }
};

export const generateAlgorithmSuite = async (topic: Topic, profile?: ChannelProfile): Promise<SEOPackage | null> => {
  try {
    const ai = getAI();
    const profileContext = profile 
      ? `BRAND CONSISTENCY: This project belongs to the channel "${profile.channelName}".
         The signature color palette is: ${profile.signatureColors}.
         Consistent visual identity: ${profile.visualIdentity}.
         Recurring character/elements to include in prompts: ${profile.recurringCharacter || 'None'}.
         Overall aesthetic: ${profile.aestheticStyle}.
         ENSURE ALL "Cover Art Prompts" strictly follow this style for channel recognition.`
      : "";

    const spatialAudioContext = topic.spatialAudio && topic.spatialAudio !== 'None' 
      ? `\n      CRITICAL AUDIO EFFECT REQUIREMENT: This song MUST be produced and marketed explicitly as an "${topic.spatialAudio}" experience. 
      - The SUNO STYLE PROMPT must explicitly include commands for this effect (e.g., "stereo panning, spatial motion, 8d audio style panning, binaural effect, immersive 3D space, rotating sound").
      - The metadata (tags, hashtags, description) MUST highlight this effect to attract listeners looking for immersive audio.
      - At least one of the thumbnail prompts should visually imply an immersive or spatial audio experience (e.g., glowing headphones, soundwaves surrounding the listener).`
      : "";

    const instrumentalAlgorithmContext = topic.isInstrumental 
      ? "\n      CRITICAL: THIS IS AN INSTRUMENTAL TRACK. The SUNO STYLE PROMPT must explicitly include 'instrumental' and focus on instrumental textures. The titles and metadata should reflect a high-quality instrumental experience." 
      : "";

    const customizationContext = `
      SONIC CUSTOMIZATION:
      - Energy Profile: ${topic.energyProfile || 'Standard Flow'}
      - Vocal Character: ${topic.vocalCharacter || 'Natural'}
      - Target BPM: ${topic.targetBpm || 'Genre standard'}
      - Rhythm Style: ${topic.rhythm || 'Standard 4/4'}
      - Cultural Influence Intensity: ${topic.culturalIntensity ? `${topic.culturalIntensity}%` : 'Standard'}
      - Mastering Profile: ${topic.masteringProfile || 'Standard/Natural'}
      - Custom Lead Melody Instrument: ${topic.customLeadInstrument || 'None / Auto'}
      - Custom Lead Influence Intensity: ${topic.customLeadIntensity ? `${topic.customLeadIntensity}%` : '50%'}
      
      CRITICAL: The SUNO STYLE PROMPT must strictly incorporate these characteristics. 
      If a "Custom Lead Melody Instrument" is specified and is not "None", it MUST be the primary melodic voice or the central lead instrument of the track, even if it creates an unconventional genre fusion (e.g., Gamelan lead in a Phonk track). 
      INTENSITY GUIDELINE FOR CUSTOM LEAD: At ${topic.customLeadIntensity || 50}% intensity:
         - LOW (<30%): The custom instrument is a "Subtle Guest". It marks the intro/outro or appears as occasional ear-candy fills. The genre's standard lead (cowbells/synths) still dominates.
         - HIGH (>70%): The custom instrument is the "Constant Lead". It plays the main riffs throughout the entire song, completely replacing the genre's typical lead voice.
         - MEDIUM (30-70%): A "Duet" feel where the custom instrument alternates or layers with the standard genre leads.
      CRITICAL RHYTHMIC INTEGRITY: When using a Custom Lead, the core rhythmic structure, drum patterns (e.g., hard-hitting Phonk 808s and drift beats), and bassline style of the selected genre MUST remain 100% unchanged. Do NOT adapt the rhythm to the traditional style of the custom instrument. The custom instrument must adapt to the genre's rhythm.
      PROMPT ENGINEERING TIP: For the "SUNO STYLE PROMPT", if a Custom Lead is used, describe it as a "digital lead" or "sampled instrument" (e.g., "Phonk Drift, 808 Bass, Digital Gamelan lead, high energy"). This prevents the AI from changing the drum kit.
      If Energy is "${topic.energyProfile}", describe the dynamic shifts accordingly.
      If Vocal Character is "${topic.vocalCharacter}", be extremely descriptive about the voice's timber and soul.
      If Mastering Profile is "${topic.masteringProfile}", apply these specific sonic characteristics:
         - "Bass Boosted": Massive sub-bass, heavy kick drums, sidechain compression, 20-60Hz emphasis.
         - "Slowed + Reverb": Ethereal space, deep hall reverb, slowed down tempo, pitch-down shift, melancholic wash.
         - "Nightcore": Fast tempo, pitch-up vocals, bright high-end, energetic dance feel.
         - "Daycore": Slowed tempo, deep bass, relaxed atmosphere.
         - "Lo-fi / Vinyl Warmth": Crackle, hiss, low-pass filters, subtle pitch wow/flutter, warm analog saturation.
         - "Clean & High Fidelity": Balanced spectrum, crystal clear highs, tight low-end, professional studio finish.
      If Cultural Influence is specified, adjust the weight of traditional instruments and scales based on the ${topic.culturalIntensity || 50}% intensity. 
         - LOW Intensity (<30%): The cultural elements should only appear as brief accents or "seasoning" (e.g., only in the intro or small fills), allowing the main genre to dominate.
         - HIGH Intensity (>70%): The cultural elements must be deeply woven into the core layers (bass, lead, rhythm) and present throughout the entire track.
    `;

    const response = await ai.models.generateContent({
      model: getModelId(),
      contents: `Initialize MODULE 2: THE MUSIC ALGORITHM SUITE for the song: "${topic.title}".
      SONG CONTEXT (Use this to create highly relevant clickbait texts and cover arts):
      Issue/Inspiration: "${topic.issueContext || 'None'}"
      Viral Logic: "${topic.viralLogic}"
      Genre: "${topic.genre}", Mood: "${topic.mood}"
      ${spatialAudioContext}
      ${topic.culturalTuning && topic.culturalTuning !== CulturalTuning.NONE ? `\n      CRITICAL MUSICAL TUNING: This song uses the "${topic.culturalTuning}" scale/system. The SUNO STYLE PROMPT must explicitly include specific scales, tuning systems, or regional instruments associated with this. 
      INTENSITY GUIDELINE: At ${topic.culturalIntensity || 50}% intensity, ${topic.culturalIntensity && topic.culturalIntensity < 30 ? 'only use cultural sounds as subtle, brief accents in the intro or transitions' : topic.culturalIntensity && topic.culturalIntensity > 70 ? 'make the cultural elements the dominant, constant theme throughout the track' : 'moderately integrate the cultural elements into the genre'}.` : ''}
      ${instrumentalAlgorithmContext}
      ${customizationContext}
      
      ${profileContext}
      REQUIREMENTS:
      1. TITLE GENERATION: Provide 3 variants for each category: Search Focused, Emotional/Clickbait, and Short-form. (Total 9 titles).
      2. COVER ART PROMPTS: Generate 3 visual prompts that prioritize GENRE VISUAL ARCHETYPES and CHANNEL BRANDING over literal song topics. 
         - Aesthetics: Match the color science and composition common in "${topic.genre}" (e.g., Neon/Cyan/High-Contrast for Phonk, Warm/Gold/Organic for Amapiano).
         - Presence: Strictly incorporate character elements: ${profile?.recurringCharacter || 'None'}.
         - Hook: Each prompt MUST explicitly include instructions for a YouTube-optimized text overlay. Max 1-4 words. Focus on "Listening Scenarios" or "Vibes" (e.g., "POV: YOU'RE DRIFTING", "SUMMER VIBE 100%"). 
         - Typography Archetype: Specify font styles based on genre:
           * If Phonk/Drift: "Aggressive, Distorted, Bold Gothic, or High-Tech Industrial fonts."
           * If Amapiano/Afro-Tech: "Clean, Elegant Modern Sans-Serif or Bold Geometric fonts."
           * General: Specify high-contrast colors, drop shadows, and heavy outlines for mobile readability. The text MUST be in ENGLISH.
      3. METADATA: Optimize for high CTR and discovery.
      4. SUNO STYLE PROMPT: Generate an EXTENSIVELY detailed music style prompt. You MUST use between 500 and 1000 characters. This is CRITICAL. List out exhaustive details: specific and extremely creative genre fusions, diverse and complex arrays of instruments (e.g., unique acoustic, specific synths, world instruments) and their playing techniques, precise tempo/BPM, vocal timber/style/gender (e.g., explicitly specify haunting female vocals, deep gravelly male voice, robotic vocoder, airy falsetto, choral backing, pitched-down voice, etc.), atmospheric adjectives, effects (reverb, delay, distortion), production era/quality, bassline style, and rhythm patterns. CRITICAL: Emphasize a "Catchy Musical Hook" or "Iconic Melodic Opening" to ensure the track grabs attention in the first 5-10 seconds. Make sure the sonic textures and vocal characteristics are varied and never monotone. Do not be brief; maximize the description to give the AI generator the most unique and dynamic context possible.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titleVariants: {
              type: Type.OBJECT,
              properties: {
                searchFocused: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  minItems: 3,
                  maxItems: 3
                },
                emotionalClickbait: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  minItems: 3,
                  maxItems: 3
                },
                shortForm: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  minItems: 3,
                  maxItems: 3
                },
              },
              required: ["searchFocused", "emotionalClickbait", "shortForm"]
            },
            sunoStyle: { type: Type.STRING, description: "An extensively detailed Suno music generation prompt. MUST be between 500 and 1000 characters long, containing extremely specific musical terminology, instruments, vocal styles, and production effects." },
            thumbnailPrompts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              minItems: 3,
              maxItems: 3
            },
            description: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            pinnedComment: { type: Type.STRING }
          },
          required: ["titleVariants", "sunoStyle", "thumbnailPrompts", "description", "tags", "hashtags", "pinnedComment"]
        }
      }
    });

    return parseGeminiResponse(response) as SEOPackage;
  } catch (error) {
    return handleGeminiError(error, "generateAlgorithmSuite");
  }
};

export const generateSongStudioData = async (
  topic: Topic,
  profile?: ChannelProfile
): Promise<SongStudioData | null> => {
  try {
    const ai = getAI();
    
    const profileContext = profile 
      ? `BRAND CONSISTENCY: Visualizer must maintain the "${profile.channelName}" identity.
         Colors: ${profile.signatureColors}. Style: ${profile.visualIdentity}.
         Recurring Elements: ${profile.recurringCharacter || 'None'}.
         The "VISUALIZER PROMPT" MUST anchor on these elements to ensure viewers recognize the channel instantly.`
      : "";

    const contextFromTopic = `
      SONG CONTEXT:
      Title: "${topic.title}"
      Issue Context / Inspiration: "${topic.issueContext || 'Not provided'}"
      Viral Logic / Background Story: "${topic.viralLogic}"
      Genre: ${topic.genre}
      Mood: ${topic.mood}
      Energy Profile: ${topic.energyProfile || 'Standard'}
      Vocal Character: ${topic.vocalCharacter || 'Natural'}
      Target BPM: ${topic.targetBpm || 'Genre Standard'}
      Rhythm Pattern: ${topic.rhythm || 'Standard'}
      Cultural Influence Intensity: ${topic.culturalIntensity ? `${topic.culturalIntensity}%` : 'Standard'}
      Custom Lead Intensity: ${topic.customLeadIntensity ? `${topic.customLeadIntensity}%` : '50%'}
      Spatial Audio Effect: ${topic.spatialAudio && topic.spatialAudio !== 'None' ? topic.spatialAudio : 'Standard'}
      Cultural Tuning: ${topic.culturalTuning && topic.culturalTuning !== 'None' ? topic.culturalTuning : 'Standard (Western)'}
      Instrumental Mode: ${topic.isInstrumental ? 'ON (No Vocals/Lyrics)' : 'OFF (Include Vocals/Lyrics)'}
    `;

    const lyricsRequirement = topic.isInstrumental
      ? '1. FULL LYRICS (INSTRUMENTAL STRUCTURE): Since this is an INSTRUMENTAL track, do NOT write any song lyrics or vocal lines. Instead, provide a complete musical structure using ONLY structural tags (e.g., [Intro], [Theme A], [Drum Fill], [Transition], [Main Theme], [Build], [Drop], [Bridge], [Solo], [Melodic Variation], [Outro]). Include brief, descriptive musical notes inside the tags (e.g., [Bass-heavy build-up]) to guide the musical evolution. Ensure the progression matches the "Viral Logic / Background Story".'
      : '1. FULL LYRICS: A unified block of lyrics including advanced, dynamic structural tags tailored to the genre and theme (e.g., [Intro Hook], [Intro], [Verse], [Build-up], [Drop], [Hook], [Chorus], [Bridge], [Beat Switch], [Outro]). Do not use a monotone or generic structure; consider "Hook-first" patterns for high energy or viral tracks to grab attention instantly. Adapt the flow and sections of the song to match the energy and emotional arc of the story. Make it poetic and rhythmic. CRITICAL: The lyrics MUST directly reflect the events, story, or viral trend described in the "Viral Logic / Background Story" field. Ground the lyrics heavily in the context so the song has a real backstory.';

    const prompt = `
      Initialize MODULE 3: THE LYRIC & VISUALIZER PRODUCTION for track "${topic.title}".
      Generate a complete song layout optimized for Suno AI.
      ${profileContext}
      ${contextFromTopic}
      ${topic.spatialAudio && topic.spatialAudio !== 'None' ? `CRITICAL INSTRUCTION: This song uses a ${topic.spatialAudio} effect. In the "SONG PRODUCTION DESCRIPTION", you must describe how the spatial and panning effects behave (e.g., sound moving around the listener's head, left-to-right panning during drops, spatial echoes, binaural dimensions) so it feels like a true 3D/immersive experience.` : ''}
      ${topic.culturalTuning && topic.culturalTuning !== CulturalTuning.NONE ? `CRITICAL INSTRUCTION: Apply "${topic.culturalTuning}" music theory and instrumentation. 
      REFERENCE FOR "${topic.culturalTuning}":
      - Makam: Use 24-tet microtonal scales, Oud, Kanun, Ney flute.
      - Oriental: Pentatonic scales, Guzheng, Koto, Erhu, Shakuhachi.
      - Raga: Sitar, Tabla, complex melodic patterns (Tanpura).
      - Slendro/Pelog: Gamelan, Saron, Bonang, Gong, microtonal tuning.
      - African Kora: 21-string harp melodies, Balafon (marimba), polyrhythms.
      - Andean: Pan pipes (Siku), Charango (small guitar), Quena flute.
      - Native American: Minor pentatonic flute, frame drums, natural textures.
      - Pacific: Ukulele, slack-key guitar, slide steel guitar.
      - Aboriginal: Didgeridoo (drone), clapsticks, earthy textures.
      - Tibetan: Deep monastic chants, singing bowls, ritual percussion.
      - Persian: Dastgah system, Santur, Tar, Setar.
      - Balkan: 7/8 or 9/8 odd meters, brass sections, accordion.
      - Bluegrass: Banjo, Fiddle, Mandolin, Upright Bass.
      - Throat Singing: Overtone singing, Morin Khuur (horse-head fiddle).
      - Thai: Piphat ensemble, Ranat ek (xylophone), Khong wong lek.
      - Ethio-Jazz: Tizita or Ambassel scales, brass mixed with traditional scales.
      
      In the "SONG PRODUCTION DESCRIPTION", explicitly detail how the instruments follow these specific scales, microtonal shifts, or traditional structures. 
      INTENSITY CONTROL:
      - If intensity is LOW (${topic.culturalIntensity || 50}% < 30%): Only introduce cultural sounds as brief/sporadic accents (e.g., just in the Intro or a single fill).
      - If intensity is HIGH (${topic.culturalIntensity || 50}% > 70%): The regional instruments and theory must be the backbone of the entire arrangement from start to finish.
      Ensure authentic regional vibes according to these constraints.` : ''}
      
      REQUIREMENTS:
      ${lyricsRequirement}
      2. SONG PRODUCTION DESCRIPTION: A detailed and highly dynamic description of the musical arrangement. As a master music producer, explicitly list a diverse and complex array of instruments. ${topic.customLeadInstrument && topic.customLeadInstrument !== CustomLeadInstrument.NONE ? `CRITICAL VOICE INTEGRATION: The lead melody (e.g., cowbell in Phonk, synth in House) will be handled by ${topic.customLeadInstrument}. 
      INTENSITY CONTROL (${topic.customLeadIntensity || 50}%): 
      ${topic.customLeadIntensity && topic.customLeadIntensity < 30 
        ? `SUBTLE: Use ${topic.customLeadInstrument} as a "Subtle Guest". It should appear only in the Intro, some transitions, and the Outro. The main meat of the song maintains its traditional ${topic.genre} leads.` 
        : topic.customLeadIntensity && topic.customLeadIntensity > 70 
          ? `DOMINANT: ${topic.customLeadInstrument} is the "Constant Lead". It MUST play the signature riffs and melodies throughout the entire track, aggressively replacing the traditional ${topic.genre} lead voices.` 
          : `BALANCED: ${topic.customLeadInstrument} layers and cycles with the standard ${topic.genre} synth/leads. It's a modern fusion where both textures coexist.`
      }
      CRITICAL RHYTHM LOCK: You MUST explicitly maintain the signature drum kit of ${topic.genre} (e.g., heavy Phonk 808s, drift trap drums). Do NOT use any regional percussion from the ${topic.customLeadInstrument}'s origin. The drums must stay 100% true to the modern ${topic.genre} style.` : `Explicitly list a diverse array of instruments (e.g., specific synths, rare acoustic instruments, cultural/ethnic instruments, unconventional percussion).`} CRITICAL: The arrangement MUST start with a powerful and catchy "Intro Hook" (melodic or rhythmic) designed for immediate viral engagement. Explicitly specify the vocal style, gender, and texture (if applicable) or the leading instrumental voice for instrumental tracks. Describe how the arrangement evolves (buildups, drops, complexity shifts) to prevent monotony. Specify dynamic variations (drops, beat switches, rhythmic variations, dynamic swells, layering changes) while maintaining the chosen genre and core idea. Be extremely creative and specific about the sonic textures, vocal/lead variations, energy transitions, and diverse instrumentation details from the hook-driven intro to the outro to ensure the final music feels attractive, alive, constantly engaging, and NEVER monotone.
      3. VISUALIZER PROMPT: A single, extremely detailed prompt for a music video visualizer (Veo). The scene MUST be designed for a SEAMLESS VIDEO LOOP (cinemagraph style).
          - Loop Compatibility: Focus on ambient, repetitive motions that don't have a clear beginning or end (e.g., drifting particles, swaying foliage, glowing rhythmic lights, falling snow, or moving clouds). Avoid objects entering or leaving the frame.
          - Subtle Life: Ensure objects or characters have subtle, repetitive "micro-motions" so they don't look frozen or stiff (e.g., a character gently blinking, subtle chest breathing motion, a floating object softly bobbing up and down, or a slight rhythmic head nod).
          - Motion & Atmosphere: The video must be SILENT and the motion should be fluid, ambient, and constant. It should NOT be strictly synced to a beat or transients, but instead provide a hypnotic, steady visual flow that matches the overall "${topic.mood}" and "${topic.genre}".
          - Aesthetics: Use color palettes that reinforce the tone (e.g., neon/dark for Phonk, warm/golden for Amapiano).
          - Brand Anchor: Ensure the presence of ${profile?.recurringCharacter || "the channel's signature visual elements"}.
          - Composition: Use a strictly LOCKED-OFF TRIPOD SHOT (no pans, tilts, zooms, drifts, or camera movement of any kind). The frame MUST remain 100% stationary and fixed throughout. All movement must be internal to the scene (e.g., characters moving, lighting changes) while the camera is completely bolted down. Explicitly FORBID words like "zoom in", "zoom out", "dolly", "push-in", or "crane" in the prompt. Use a cinematic wide shot with detailed lighting and textures that feel alive and immersive.
      4. UNIFIED SUNO UPLOAD PROMPT (MASTER DESCRIPTION): A single, ultra-high-density, exhaustive production brief (MAXIMIZE UP TO 2950 characters) designed for Suno AI's "Song Description" box (Simple Mode). 
          - ULTIMATE SYNTHESIS CHECKLIST: You MUST explicitly weave every single one of the following parameters into a cohesive narrative:
            * CORE IDENTITY: Precise Genre (${topic.genre}), specific Mood (${topic.mood}), target BPM (${topic.targetBpm}), and Rhythm Style (${topic.rhythm}).
            * CUSTOM LEAD ENGINE: The ${topic.customLeadInstrument} logic. Explicitly state its role based on intensity (${topic.customLeadIntensity}%): if high, it replaces traditional leads; if low, it's a guest element.
            * MUSICAL TUNING: The ${topic.culturalTuning} scale influence at ${topic.culturalIntensity}% intensity.
            * SONIC ARCHITECTURE: The specific "${topic.spatialAudio}" spatial effect and "${topic.masteringProfile}" sonic texture.
            * VOCAL/ENERGY DNA: The "${topic.vocalCharacter}" timber and "${topic.energyProfile}" dynamic flow.
          - STRUCTURAL FLOW (ALUR LAGU): Map out every single section of the lyrics (Intro, Verses, Pre-Chorus, Chorus, Bridge, Outro) with specific musical instructions for each. Describe the instrumental "drops", "beat switches", and energy transitions in extreme detail.
          - TECHNICAL RIGOR: Describe the drum kit precisely (e.g., "heavy compressed Phonk 808s", "tight digital percussion") to ensure the rhythm doesn't change when using custom instruments.
          - NARRATIVE INTEGRATION: Convert the full narrative soul and vocabulary of the generated lyrics into a descriptive production guide so Suno understands the vocal emotion and "story" behind the song.
          - Goal: To create a prompt so rich and detailed (utilizing the full ~2950 chars) that it acts as a professional-grade production sheet for Suno AI.
      
      Provide strictly JSON output.
    `;

    const response = await ai.models.generateContent({
      model: getModelId(),
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lyrics: { type: Type.STRING },
            productionDescription: { type: Type.STRING },
            visualizerPrompt: { type: Type.STRING },
            unifiedSunoPrompt: { type: Type.STRING },
          },
          required: ["lyrics", "productionDescription", "visualizerPrompt", "unifiedSunoPrompt"]
        }
      }
    });

    const parsed = parseGeminiResponse(response);
    return parsed as SongStudioData;
  } catch (error) {
    return handleGeminiError(error, "generateSongStudioData");
  }
};

export const generateVeoVideo = async (prompt: string, selectedModel: string = 'veo-3.1-fast-generate-preview', apiKey?: string): Promise<string | null> => {
  try {
    const keyToUse = getAPIKey(apiKey);
    const veoAi = getAI(apiKey);
    
    // Explicitly enforce SFX only and no background music in the prompt to the model
    const enforcedPrompt = `${prompt} . Audio: Realistic sound effects (SFX) only. No background music. No musical score.`;

    let operation = await veoAi.models.generateVideos({
      model: selectedModel,
      prompt: enforcedPrompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await veoAi.operations.getVideosOperation({operation: operation});
    }

    const video = operation.response?.generatedVideos?.[0];
    if (video?.video?.uri) {
        const downloadLink = video.video.uri;
        
        // Use window.fetch explicitly to avoid potential conflicts if global fetch was tinkered with
        const resp = await window.fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': keyToUse || '',
          },
        });
        
        if (!resp.ok) {
          throw new Error(`Failed to download video: ${resp.status} ${resp.statusText}`);
        }

        const blob = await resp.blob();
        return URL.createObjectURL(blob);
    }

    return null;
  } catch (error) {
    return handleGeminiError(error, "generateVeoVideo");
  }
};

export const generateThumbnail = async (prompt: string, selectedModel: string, includeText: boolean = false, apiKey?: string): Promise<string | null> => {
  try {
    const keyToUse = getAPIKey(apiKey);
    const imgAi = getAI(apiKey);
    
    // Config logic: ImageSize is ONLY supported on Gemini 3 Pro
    const config: any = {
      imageConfig: {
        aspectRatio: "16:9" // Supported by both (flash-image respects AR mostly)
      }
    };

    if (selectedModel === 'gemini-3-pro-image-preview') {
      config.imageConfig.imageSize = "2K"; // Upgrade resolution for Pro
    }

    let optimizedPrompt = `Professional YouTube Thumbnail, Masterpiece, 8K resolution, Highly Detailed, Dramatic Lighting. ${prompt}.`;

    if (includeText) {
      optimizedPrompt += " VERY IMPORTANT: Add a short, punchy, viral TEXT overlay (max 2-4 words) that creates curiosity. Use BOLD, HIGH-CONTRAST typography (like bright Yellow, White, or Red). Ensure the text is large, legible, and placed strategically (center or rule of thirds) without obscuring the main subject.";
    } else {
      optimizedPrompt += " VERY IMPORTANT: DO NOT include any text, letters, typography, or logos. The image must be completely clean of words. Focus solely on the visual composition.";
    }

    const response = await imgAi.models.generateContent({
      model: selectedModel,
      contents: {
        parts: [
          {
            text: optimizedPrompt
          },
        ],
      },
      config: config
    });

    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    return null;
  } catch (error) {
    return handleGeminiError(error, "generateThumbnail");
  }
};
