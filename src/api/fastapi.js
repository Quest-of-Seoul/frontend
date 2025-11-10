/**
 * FastAPI backend API client
 */

import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { isExpoGo } from '../utils/audio';

// 🚀 API URL 감지
const getApiUrl = () => {
  // 1. .env에서 API_URL 사용 (로컬 또는 Render 서버)
  const API_URL = Constants.expoConfig?.extra?.API_URL;

  if (API_URL) {
    const url = API_URL.trim();
    // http:// 또는 https://가 없으면 자동 추가
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `http://${url}`;
    }
    return url;
  }

  // 2. 폴백: 플랫폼별 localhost 자동 감지
  const localhost = Platform.select({
    // Android 에뮬레이터
    android: '10.0.2.2',
    // iOS 시뮬레이터 또는 Expo Go (실제 기기)
    ios: Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost',
    // 기본값
    default: 'localhost',
  });

  return `http://${localhost}:8000`;
};

const API_BASE_URL = getApiUrl();

// WebSocket URL 생성 (http -> ws, https -> wss)
const getWebSocketUrl = () => {
  return API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://');
};

const WS_BASE_URL = getWebSocketUrl();

// 디버깅용 - 현재 사용 중인 API URL 출력
console.log('📡 API URL:', API_BASE_URL);
console.log('🔌 WebSocket URL:', WS_BASE_URL);
console.log('📱 App Mode:', isExpoGo() ? 'Expo Go' : 'Standalone');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== Docent APIs =====

/**
 * Get AI docent message about a landmark
 * Always use URL (Supabase Storage) for better audio quality
 */
export const getDocentMessage = async (userId, landmark, userMessage = null, language = 'ko', enableTts = true) => {
  try {
    // Always use URL for stable audio playback
    const preferUrl = true;

    const response = await api.post('/docent/chat', {
      user_id: userId,
      landmark,
      user_message: userMessage,
      language,
      prefer_url: preferUrl,
      enable_tts: enableTts,
    });
    return response.data;
  } catch (error) {
    console.error('Error getting docent message:', error);
    throw error;
  }
};

/**
 * Get quiz about a landmark
 */
export const getQuiz = async (landmark, language = 'ko') => {
  try {
    const response = await api.post('/docent/quiz', null, {
      params: { landmark, language },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting quiz:', error);
    throw error;
  }
};

/**
 * Convert text to speech
 * Automatically detects Expo Go and sets prefer_url accordingly
 */
export const textToSpeech = async (text, languageCode = 'ko-KR') => {
  try {
    const preferUrl = isExpoGo();

    const response = await api.post('/docent/tts', {
      text,
      language_code: languageCode,
      prefer_url: preferUrl,
    });
    return response.data;
  } catch (error) {
    console.error('Error converting text to speech:', error);
    throw error;
  }
};

/**
 * Get chat history
 */
export const getChatHistory = async (userId, limit = 10) => {
  try {
    const response = await api.get(`/docent/history/${userId}`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
};

// ===== Quest APIs =====

/**
 * Get all quests
 */
export const getAllQuests = async () => {
  try {
    const response = await api.get('/quest/list');
    return response.data.quests;
  } catch (error) {
    console.error('Error getting quests:', error);
    throw error;
  }
};

/**
 * Get nearby quests
 */
export const getNearbyQuests = async (lat, lon, radiusKm = 1.0) => {
  try {
    const response = await api.post('/quest/nearby', {
      lat,
      lon,
      radius_km: radiusKm,
    });
    return response.data;
  } catch (error) {
    console.error('Error getting nearby quests:', error);
    throw error;
  }
};

/**
 * Update quest progress
 */
export const updateQuestProgress = async (userId, questId, status) => {
  try {
    const response = await api.post('/quest/progress', {
      user_id: userId,
      quest_id: questId,
      status,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating quest progress:', error);
    throw error;
  }
};

/**
 * Get user's quests
 */
export const getUserQuests = async (userId, status = null) => {
  try {
    const response = await api.get(`/quest/user/${userId}`, {
      params: status ? { status } : {},
    });
    return response.data.quests;
  } catch (error) {
    console.error('Error getting user quests:', error);
    throw error;
  }
};

/**
 * Get quest details
 */
export const getQuestDetail = async (questId) => {
  try {
    const response = await api.get(`/quest/${questId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting quest detail:', error);
    throw error;
  }
};

// ===== Reward APIs =====

/**
 * Get user points
 */
export const getUserPoints = async (userId) => {
  try {
    const response = await api.get(`/reward/points/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting user points:', error);
    throw error;
  }
};

/**
 * Add points to user
 */
export const addPoints = async (userId, points, reason = 'Quest completion') => {
  try {
    const response = await api.post('/reward/points/add', {
      user_id: userId,
      points,
      reason,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding points:', error);
    throw error;
  }
};

/**
 * Get available rewards
 */
export const getAvailableRewards = async () => {
  try {
    const response = await api.get('/reward/list');
    return response.data.rewards;
  } catch (error) {
    console.error('Error getting rewards:', error);
    throw error;
  }
};

/**
 * Claim a reward
 */
export const claimReward = async (userId, rewardId) => {
  try {
    const response = await api.post('/reward/claim', {
      user_id: userId,
      reward_id: rewardId,
    });
    return response.data;
  } catch (error) {
    console.error('Error claiming reward:', error);
    throw error;
  }
};

/**
 * Get claimed rewards
 */
export const getClaimedRewards = async (userId) => {
  try {
    const response = await api.get(`/reward/claimed/${userId}`);
    return response.data.claimed_rewards;
  } catch (error) {
    console.error('Error getting claimed rewards:', error);
    throw error;
  }
};

/**
 * Use a reward
 */
export const useReward = async (rewardId, userId) => {
  try {
    const response = await api.post(`/reward/use/${rewardId}`, null, {
      params: { user_id: userId },
    });
    return response.data;
  } catch (error) {
    console.error('Error using reward:', error);
    throw error;
  }
};

// ===== WebSocket APIs (Standalone apps only) =====

/**
 * Get AI docent message via WebSocket with TTS streaming
 * Only for standalone apps (not Expo Go)
 * @param {string} userId - User ID
 * @param {string} landmark - Landmark name
 * @param {string} userMessage - Optional user message
 * @param {string} language - Language code
 * @param {function} onTextReceived - Callback for text message
 * @param {function} onAudioChunk - Callback for audio chunks
 * @param {boolean} enableTts - Whether to generate TTS (default: true)
 * @returns {Promise<object>} Response with message
 */
export const getDocentMessageWS = async (
  userId,
  landmark,
  userMessage = null,
  language = 'ko',
  onTextReceived = null,
  onAudioChunk = null,
  enableTts = true
) => {
  return new Promise((resolve, reject) => {
    const wsUrl = `${WS_BASE_URL}/docent/ws/chat`;
    console.log('🔌 Connecting to:', wsUrl);

    const ws = new WebSocket(wsUrl);

    // Set binary type to arraybuffer for React Native compatibility
    ws.binaryType = 'arraybuffer';

    const audioChunks = [];
    let textResponse = null;

    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      ws.send(
        JSON.stringify({
          user_id: userId,
          landmark,
          user_message: userMessage,
          language,
          enable_tts: enableTts,
        })
      );
    };

    ws.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        const message = event.data;

        if (message === 'DONE') {
          console.log('✅ WebSocket chat complete');
          ws.close();
          resolve({
            message: textResponse?.message,
            audioChunks,
            landmark: textResponse?.landmark,
          });
        } else {
          try {
            const data = JSON.parse(message);
            if (data.type === 'text') {
              textResponse = data;
              console.log('📨 Text received:', data.message.substring(0, 50) + '...');
              if (onTextReceived) onTextReceived(data);
            } else if (data.error) {
              console.error('❌ Server error:', data.error);
              reject(new Error(data.error));
              ws.close();
            }
          } catch (e) {
            console.log('📨 Server message:', message);
          }
        }
      } else {
        // Binary audio chunk
        audioChunks.push(event.data);
        if (onAudioChunk) onAudioChunk(event.data);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      reject(error);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket closed');
    };
  });
};

/**
 * Convert text to speech via WebSocket streaming
 * Only for standalone apps (not Expo Go)
 * @param {string} text - Text to convert
 * @param {string} languageCode - Language code
 * @param {function} onAudioChunk - Optional callback for each chunk
 * @returns {Promise<Array>} Array of audio chunks (Blobs)
 */
export const textToSpeechWS = async (text, languageCode = 'ko-KR', onAudioChunk = null) => {
  return new Promise((resolve, reject) => {
    const wsUrl = `${WS_BASE_URL}/docent/ws/tts`;
    console.log('🔌 Connecting to:', wsUrl);

    const ws = new WebSocket(wsUrl);

    // Set binary type to arraybuffer for React Native compatibility
    ws.binaryType = 'arraybuffer';

    const audioChunks = [];

    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      ws.send(JSON.stringify({ text, language_code: languageCode }));
    };

    ws.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        const message = event.data;

        if (message === 'DONE') {
          console.log('✅ WebSocket TTS complete');
          ws.close();
          resolve(audioChunks);
        } else {
          try {
            const data = JSON.parse(message);
            if (data.error) {
              console.error('❌ Server error:', data.error);
              reject(new Error(data.error));
              ws.close();
            }
          } catch (e) {
            console.log('📨 Server message:', message);
          }
        }
      } else {
        // Binary audio chunk
        audioChunks.push(event.data);
        if (onAudioChunk) onAudioChunk(event.data);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      reject(error);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket closed');
    };
  });
};

export default api;
