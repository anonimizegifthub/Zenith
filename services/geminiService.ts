import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { Topic, SEOPackage, SongStudioData, Region, MusicGenre, MusicMood, GroundingSource, ProductionMode } from '../types';

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
    // Note: response.text is a getter in the new SDK
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
  mode: ProductionMode = ProductionMode.GENRE_PURITY
): Promise<Topic[]> => {
  try {
    const ai = getAI();
    const categoryList = categories.length > 0 ? categories.join(", ") : "Semua Genre Musik Populer";
    
    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            viralLogic: { type: Type.STRING },
            predictedCTR: { type: Type.NUMBER },
            visualPotential: { type: Type.STRING },
            genre: { type: Type.STRING, enum: Object.values(MusicGenre) },
            mood: { type: Type.STRING, enum: Object.values(MusicMood) },
            tempo: { type: Type.STRING },
          },
          required: ["title", "viralLogic", "predictedCTR", "visualPotential", "genre", "mood"]
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
      Target Region: ${region}
      Target Genres: ${categoryList}
      Production Mode: ${mode}
      ${useSearch ? "REAL-TIME SEARCH ENABLED: Access current TikTok Billboard and Spotify Charts." : ""}

      Suggest 5 viral song concepts that are highly relevant to ${region} but have global appeal.
      
      REQUIREMENTS:
      1. COVERAGE: Explore deep into ${categoryList}. 
      2. TONE & MODE: "Sonic Architecture" with focal point on ${mode}.
         - If Genre Purity: focus on highly consistent, polished execution of the specific genre.
         - If Channel Cohesion: focus on concepts that build a strong, recognizable brand identity across these 5 tracks.
         - If Trend Sprinter: prioritize high-speed virality and current meme/trend synergy.
      3. CATCHINESS: Focus on concepts with deep hooks and consistent atmosphere.
      4. TRENDS: Integrate viral social themes or relatable human emotions.`,
      config: config
    });

    const parsed = parseGeminiResponse(response);
    if (!parsed) {
        throw new Error("Empty or invalid response from neural core");
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
    if (sources.length > 0 && Array.isArray(topics)) {
      topics.forEach(t => {
        if (t) t.sources = sources;
      });
    }

    return topics;
  } catch (error: any) {
    console.error("generateIdeas API Error:", error);
    // Rethrow to allow UI to handle specific error messages if needed
    throw error;
  }
};

export const optimizeManualTopic = async (rawInput: string, useSearch: boolean = false): Promise<Topic | null> => {
  try {
    const ai = getAI();
    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          viralLogic: { type: Type.STRING },
          predictedCTR: { type: Type.NUMBER },
          visualPotential: { type: Type.STRING },
        },
        required: ["title", "viralLogic", "predictedCTR", "visualPotential"]
      }
    };

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: getModelId(),
      contents: `Initialize MODULE 1: MANUAL MUSIC INPUT. 
      User Input: "${rawInput}".
      ${useSearch ? "REAL-TIME SEARCH ENABLED: Access current music trends." : ""}
      
      Task:
      1. Analyze the user request for a song. 
      2. OPTIMIZE the phrasing to be a viral song title.
      3. Generate the genre, mood, viral logic, predicted catchy-rate, and visual potential.`,
      config: config
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

    return parsed as Topic;
  } catch (error) {
    console.error("optimizeManualTopic API Error:", error);
    return null;
  }
};

export const generateAlgorithmSuite = async (topicTitle: string): Promise<SEOPackage | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: getModelId(),
      contents: `Initialize MODULE 2: THE MUSIC ALGORITHM SUITE for the song: "${topicTitle}". 
      PROVIDE 3 VARIATIONS for Titles and 3 VARIATIONS for Cover Art Prompts.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titleVariants: {
              type: Type.OBJECT,
              properties: {
                searchFocused: { type: Type.STRING },
                emotionalClickbait: { type: Type.STRING },
                shortForm: { type: Type.STRING },
              },
              required: ["searchFocused", "emotionalClickbait", "shortForm"]
            },
            sunoStyle: { type: Type.STRING },
            thumbnailPrompts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              minItems: 3,
              maxItems: 3
            },
            thumbnailText: {
              type: Type.ARRAY,
              items: { 
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["text", "description"]
              }
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
          required: ["titleVariants", "sunoStyle", "thumbnailPrompts", "thumbnailText", "description", "tags", "hashtags", "pinnedComment"]
        }
      }
    });

    return parseGeminiResponse(response) as SEOPackage;
  } catch (error) {
    console.error("generateAlgorithmSuite API Error:", error);
    return null;
  }
};

export const generateSongStudioData = async (
  topicTitle: string
): Promise<SongStudioData | null> => {
  try {
    const ai = getAI();
    
    const prompt = `
      Initialize MODULE 3: THE LYRIC & VISUALIZER PRODUCTION for track "${topicTitle}".
      Generate a complete song layout optimized for Suno AI.
      
      REQUIREMENTS:
      1. FULL LYRICS: A unified block of lyrics including structural tags like [Intro], [Verse 1], [Chorus], [Bridge], [Outro]. Make it poetic and rhythmic.
      2. SONG PRODUCTION DESCRIPTION: A detailed description of the musical arrangement, instruments, and energy transitions to be used in Suno's "Style of Music" or as a guide.
      3. VISUALIZER PROMPT: A single, extremely detailed prompt for a music video visualizer (Veo). Create a vivid scene that matches the song's energy.
      
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
          },
          required: ["lyrics", "productionDescription", "visualizerPrompt"]
        }
      }
    });

    const parsed = parseGeminiResponse(response);
    return parsed as SongStudioData;
  } catch (error) {
    console.error("generateSongStudioData API Error:", error);
    return null;
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
        const resp = await fetch(downloadLink, {
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
    console.error("generateVeoVideo API Error:", error);
    throw error;
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

    let optimizedPrompt = `High quality YouTube thumbnail. Realistic, Sci-Fi, Cinematic, High Contrast. ${prompt}.`;

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
    console.error("generateThumbnail API Error:", error);
    throw error;
  }
};