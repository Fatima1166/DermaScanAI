// src/services/apiService.ts
import { API_CONFIG, getEndpointUrl } from '../config/apiconfig';

// ============================================
// SIMPLE IN-MEMORY CACHE
// ============================================
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL: number; // in milliseconds

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    // default 5 minutes
    this.defaultTTL = defaultTTL;
  }

  get<T>(key: string, ttl: number = this.defaultTTL): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

const apiCache = new ApiCache();

interface OCRResult {
  text: string | null;
  provider: string;
  confidence?: number;
}

interface AnalysisResult {
  compatibility: {
    status: string;
    icon: string;
    score: number;
  };
  key_insights: {
    pros: Array<{
      text: string;
      icon: string;
      scientific_name: string;
    }>;
    cons: Array<{
      text: string;
      icon: string;
      scientific_name: string;
    }>;
  };
  full_ingredients: string[];
  recommendation: {
    text: string;
    skin_type: string;
    patch_test: boolean;
    usage_tips: string[];
  };
  warnings: string[];
  interactions: string[];
  metadata?: any;
}

interface SkinQuizResult {
  skinType: string;
  clinicalDescription: string;
  dailyRoutine: {
    morning: string[];
    evening: string[];
  };
  ingredients: {
    lookFor: string[];
    avoid: string[];
  };
  productTextures: {
    cleanser: string;
    moisturizer: string;
    sunscreen: string;
    serum: string;
    toner: string;
  };
  seasonalCare: {
    summer: string[];
    winter: string[];
    monsoon: string[];
  };
  mistakes: string[];
  lifestyle: {
    diet: string[];
    habits: string[];
    sleep: string;
    water: string;
    exercise: string;
  };
}

interface WeatherResult {
  weather: any;
  uvIndex: number | null;
  weatherCategory: string;
  recommendations: {
    skincare: Array<{
      id: number;
      title: string;
      description: string;
      ref: string;
    }>;
    avoid: Array<{
      id: number;
      title: string;
      description: string;
      ref: string;
    }>;
    homeRemedies: Array<{
      id: number;
      title: string;
      description: string;
      ref: string;
    }>;
    diet: Array<{
      id: number;
      title: string;
      description: string;
      ref: string;
    }>;
  };
}

interface DiseaseResult {
  description: string;
  causes: string;
  treatments: string;
  showDoctorNote: boolean;
}

class ApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  }

  async performOCR(imageBase64: string): Promise<OCRResult> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/ingredients/ocr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64 }),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('OCR API Error:', error);
      throw error;
    }
  }

  async analyzeIngredients(
    ingredientText: string,
    ocrProvider?: string,
    ocrConfidence?: number
  ): Promise<AnalysisResult> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/ingredients/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredientText,
          ocrProvider,
          ocrConfidence,
        }),
      });
      return await this.handleResponse(response);
    } catch (error: any) {
      console.error('Analysis API Error:', error);
      if (error.message === 'Invalid Product Type') {
        throw new Error('Invalid Product Type');
      }
      throw error;
    }
  }

  async analyzeSkinQuiz(
    userAnswers: Array<{ question: string; answer: string }>
  ): Promise<SkinQuizResult> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/quiz/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userAnswers }),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Quiz API Error:', error);
      throw error;
    }
  }

  async sendChatMessage(message: string, messages: any[]): Promise<string> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, messages }),
      });
      const result = await this.handleResponse(response);
      return result.reply || result;
    } catch (error) {
      console.error('Chat API Error:', error);
      throw error;
    }
  }

  async getWeatherRecommendations(city: string, timeOfDay: string): Promise<WeatherResult> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/weather/weather`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city, timeOfDay }),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Weather API Error:', error);
      throw error;
    }
  }

  async analyzeSkinDisease(diseaseName: string): Promise<DiseaseResult> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/disease/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ diseaseName }),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Disease Analysis API Error:', error);
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // ============================================
  // DASHBOARD ENDPOINTS
  // ============================================

  async fetchWelcomeMessage(): Promise<{ greeting: string; message: string }> {
    const cacheKey = 'welcome_message';
    const cached = apiCache.get<{ greeting: string; message: string }>(cacheKey, 10 * 60 * 1000); // 10 min
    if (cached) return cached;

    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/dashboard/welcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await this.handleResponse(response);
      apiCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Welcome message API Error:', error);
      throw error;
    }
  }

  async fetchMoodMessage(mood: { emoji: string; label: string; description: string }): Promise<string> {
    const cacheKey = `mood_${mood.label}`;
    const cached = apiCache.get<string>(cacheKey, 15 * 60 * 1000); // 15 min
    if (cached) return cached;

    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/dashboard/mood`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood }),
      });
      const result = await this.handleResponse(response);
      const message = result.message || result;
      apiCache.set(cacheKey, message);
      return message;
    } catch (error) {
      console.error('Mood message API Error:', error);
      throw error;
    }
  }

  async fetchGlowTipInfo(tip: string): Promise<{
    title: string;
    description: string;
    benefits: string[];
    howToUse: string;
  }> {
    const cacheKey = `glow_tip_${tip}`;
    const cached = apiCache.get<any>(cacheKey, 30 * 60 * 1000); // 30 min
    if (cached) return cached;

    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/dashboard/glow-tip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tip }),
      });
      const data = await this.handleResponse(response);
      apiCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Glow tip API Error:', error);
      throw error;
    }
  }

  async fetchMythsAndFacts(): Promise<{
    myths: Array<{ category: string; myth: string; fact: string }>;
  }> {
    const cacheKey = 'myths_and_facts';
    const cached = apiCache.get<any>(cacheKey, 60 * 60 * 1000); // 1 hour
    if (cached) return cached;

    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/dashboard/myths`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await this.handleResponse(response);
      apiCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Myths & Facts API Error:', error);
      throw error;
    }
  }

  // Cache management
  clearCache(): void {
    apiCache.clear();
  }
}

export const apiService = new ApiService();