import axios from 'axios';
import { Platform } from 'react-native';

const getApiUrl = () => {
  const API_URL = process.env.API_URL;

  if (API_URL) {
    const url = API_URL.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `http://${url}`;
    }
    return url;
  }

  const localhost = Platform.select({
    android: '10.0.2.2',
    ios: 'localhost',
    default: 'localhost',
  });

  return `http://${localhost}:8000`;
};

const API_BASE_URL = getApiUrl();

const getWebSocketUrl = () => {
  return API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://');
};

const WS_BASE_URL = getWebSocketUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== Docent APIs =====

export const docentChat = async (userId, landmark, userMessage = null, language = 'ko', preferUrl = false, enableTts = true) => {
  try {
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
    console.error('Error in docent chat:', error);
    throw error;
  }
};

export const getDocentQuiz = async (landmark, language = 'ko') => {
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

export const textToSpeech = async (text, languageCode = 'ko-KR', preferUrl = false) => {
  try {
    const response = await api.post('/docent/tts', {
      text,
      language_code: languageCode,
      prefer_url: preferUrl,
    });
    return response.data;
  } catch (error) {
    console.error('Error in TTS:', error);
    throw error;
  }
};

export const getDocentHistory = async (userId, limit = 10) => {
  try {
    const response = await api.get(`/docent/history/${userId}`, {
      params: { limit },
    });
    return response.data.history;
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
};

// ===== Quest APIs =====

export const getAllQuests = async () => {
  try {
    const response = await api.get('/quest/list');
    return response.data.quests;
  } catch (error) {
    console.error('Error getting quests:', error);
    throw error;
  }
};

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

export const getQuestDetail = async (questId) => {
  try {
    const response = await api.get(`/quest/${questId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting quest detail:', error);
    throw error;
  }
};

export const getUserPoints = async (userId) => {
  try {
    const response = await api.get(`/reward/points/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting user points:', error);
    throw error;
  }
};

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

export const getAvailableRewards = async () => {
  try {
    const response = await api.get('/reward/list');
    return response.data.rewards;
  } catch (error) {
    console.error('Error getting rewards:', error);
    throw error;
  }
};

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

export const getClaimedRewards = async (userId) => {
  try {
    const response = await api.get(`/reward/claimed/${userId}`);
    return response.data.claimed_rewards;
  } catch (error) {
    console.error('Error getting claimed rewards:', error);
    throw error;
  }
};

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

// ===== VLM APIs =====

export const analyzeImage = async (
  userId,
  imageBase64,
  latitude = null,
  longitude = null,
  language = 'ko',
  preferUrl = true,
  enableTts = true,
  useCache = true
) => {
  try {
    const response = await api.post('/vlm/analyze', {
      user_id: userId,
      image: imageBase64,
      latitude,
      longitude,
      language,
      prefer_url: preferUrl,
      enable_tts: enableTts,
      use_cache: useCache,
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};

export const analyzeImageMultipart = async (formData) => {
  try {
    const response = await api.post('/vlm/analyze-multipart', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing image (multipart):', error);
    throw error;
  }
};

export const findSimilarImages = async (imageBase64, limit = 3, threshold = 0.7) => {
  try {
    const response = await api.post('/vlm/similar', {
      image: imageBase64,
      limit,
      threshold,
    });
    return response.data;
  } catch (error) {
    console.error('Error finding similar images:', error);
    throw error;
  }
};

export const embedImage = async (formData) => {
  try {
    const response = await api.post('/vlm/embed', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error embedding image:', error);
    throw error;
  }
};

export const getNearbyPlaces = async (latitude, longitude, radiusKm = 1.0, limit = 10) => {
  try {
    const response = await api.get('/vlm/places/nearby', {
      params: {
        latitude,
        longitude,
        radius_km: radiusKm,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting nearby places:', error);
    throw error;
  }
};

export const getVLMHealth = async () => {
  try {
    const response = await api.get('/vlm/health');
    return response.data;
  } catch (error) {
    console.error('Error checking VLM health:', error);
    throw error;
  }
};

// ===== Recommend APIs =====

export const getSimilarPlaces = async (
  userId,
  imageBase64,
  latitude = null,
  longitude = null,
  radiusKm = 5.0,
  limit = 5,
  questOnly = true
) => {
  try {
    const response = await api.post('/recommend/similar-places', {
      user_id: userId,
      image: imageBase64,
      latitude,
      longitude,
      radius_km: radiusKm,
      limit,
      quest_only: questOnly,
    });
    return response.data;
  } catch (error) {
    console.error('Error getting similar places:', error);
    throw error;
  }
};

export const getNearbyQuestsRecommend = async (latitude, longitude, radiusKm = 5.0, limit = 10) => {
  try {
    const response = await api.get('/recommend/nearby-quests', {
      params: {
        latitude,
        longitude,
        radius_km: radiusKm,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting nearby quests (recommend):', error);
    throw error;
  }
};

export const getQuestsByCategory = async (category, limit = 20) => {
  try {
    const response = await api.get(`/recommend/quests/category/${category}`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting quests by category:', error);
    throw error;
  }
};

export const getQuestDetailRecommend = async (questId) => {
  try {
    const response = await api.get(`/recommend/quests/${questId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting quest detail (recommend):', error);
    throw error;
  }
};

export const submitQuizAnswer = async (questId, userId, quizId, answer) => {
  try {
    const response = await api.post(`/recommend/quests/${questId}/submit`, null, {
      params: {
        user_id: userId,
        quiz_id: quizId,
        answer,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting quiz answer:', error);
    throw error;
  }
};

export const getRecommendStats = async () => {
  try {
    const response = await api.get('/recommend/stats');
    return response.data;
  } catch (error) {
    console.error('Error getting recommend stats:', error);
    throw error;
  }
};

// ===== WebSocket APIs =====

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

    const ws = new WebSocket(wsUrl);

    ws.binaryType = 'arraybuffer';

    const audioChunks = [];
    let textResponse = null;

    ws.onopen = () => {
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
              if (onTextReceived) onTextReceived(data);
            } else if (data.error) {
              console.error('Server error:', data.error);
              reject(new Error(data.error));
              ws.close();
            }
          } catch (e) {
            // Ignore non-JSON messages
          }
        }
      } else {
        audioChunks.push(event.data);
        if (onAudioChunk) onAudioChunk(event.data);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      reject(error);
    };

    ws.onclose = () => {
      // WebSocket closed
    };
  });
};

export const textToSpeechWS = async (text, languageCode = 'ko-KR', onAudioChunk = null) => {
  return new Promise((resolve, reject) => {
    const wsUrl = `${WS_BASE_URL}/docent/ws/tts`;

    const ws = new WebSocket(wsUrl);

    ws.binaryType = 'arraybuffer';

    const audioChunks = [];

    ws.onopen = () => {
      ws.send(JSON.stringify({ text, language_code: languageCode }));
    };

    ws.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        const message = event.data;

        if (message === 'DONE') {
          ws.close();
          resolve(audioChunks);
        } else {
          try {
            const data = JSON.parse(message);
            if (data.error) {
              console.error('Server error:', data.error);
              reject(new Error(data.error));
              ws.close();
            }
          } catch (e) {
            // Ignore non-JSON messages
          }
        }
      } else {
        audioChunks.push(event.data);
        if (onAudioChunk) onAudioChunk(event.data);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      reject(error);
    };

    ws.onclose = () => {
      // WebSocket closed
    };
  });
};

export default api;
