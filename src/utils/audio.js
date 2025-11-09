/**
 * Audio playback utility
 * Handles multiple audio playback methods:
 * - URL playback (Expo Go - Supabase Storage)
 * - WebSocket streaming (Standalone apps)
 * - Base64 playback (Fallback)
 */

import { Audio } from 'expo-av';
import Constants from 'expo-constants';

let currentSound = null;

/**
 * Detect if app is running in Expo Go
 * @returns {boolean} True if Expo Go, false if standalone
 */
export const isExpoGo = () => {
  return Constants.appOwnership === 'expo';
};

/**
 * Play base64 encoded audio
 * Uses FileSystem method for better Expo Go compatibility
 * @param {string} base64Audio - Base64 encoded audio data
 * @returns {Promise<void>}
 */
export const playAudioFromBase64 = async (base64Audio) => {
  if (!base64Audio) {
    console.log('No audio data provided');
    return;
  }

  // Use FileSystem method first (more reliable in Expo Go)
  try {
    await playAudioUsingFileSystem(base64Audio);
  } catch (fileSystemError) {
    // Fallback to data URI method (silently)
    try {
      await playAudioUsingDataURI(base64Audio);
    } catch (dataUriError) {
      console.error('❌ Audio playback failed:', dataUriError);
    }
  }
};

/**
 * Primary method: Play audio using FileSystem
 * This method writes base64 to a temporary file first
 * More reliable in Expo Go
 */
const playAudioUsingFileSystem = async (base64Audio) => {
  try {
    // Dynamic import for expo-file-system
    let FileSystem;
    try {
      FileSystem = require('expo-file-system');
    } catch (requireError) {
      console.warn('expo-file-system not available, trying alternative approach');
      throw new Error('expo-file-system module not found');
    }

    // Try multiple directory options
    let targetDir = null;
    if (FileSystem.cacheDirectory) {
      targetDir = FileSystem.cacheDirectory;
    } else if (FileSystem.documentDirectory) {
      targetDir = FileSystem.documentDirectory;
    } else {
      // Silently fail to Data URI method
      throw new Error('FileSystem directory not available');
    }

    // Create a temporary file path
    const fileUri = `${targetDir}audio_${Date.now()}.mp3`;
    console.log('💾 Writing to:', fileUri);

    // Write base64 to file
    await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Stop any currently playing audio
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

    // Create and play the sound
    const { sound } = await Audio.Sound.createAsync(
      { uri: fileUri },
      { shouldPlay: true }
    );

    currentSound = sound;

    // Clean up when playback finishes
    sound.setOnPlaybackStatusUpdate(async (status) => {
      if (status.didJustFinish) {
        await sound.unloadAsync();
        // Clean up temporary file
        try {
          if (FileSystem && FileSystem.deleteAsync) {
            await FileSystem.deleteAsync(fileUri, { idempotent: true });
          }
        } catch (deleteError) {
          console.warn('Could not delete temp audio file:', deleteError);
        }
        currentSound = null;
      }
    });

    console.log('✅ Audio playback started (FileSystem method)');
  } catch (error) {
    // Silently fail to Data URI fallback
    throw error;
  }
};

/**
 * Fallback method: Play audio using Data URI
 * Less reliable but doesn't require FileSystem
 */
const playAudioUsingDataURI = async (base64Audio) => {
  try {
    // Stop any currently playing audio
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

    // Create a data URI from base64
    const audioUri = `data:audio/mp3;base64,${base64Audio}`;

    // Create and play the sound with optimized settings
    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUri },
      {
        shouldPlay: true,
        progressUpdateIntervalMillis: 100,
        isLooping: false,
        volume: 1.0,
        isMuted: false,
        rate: 1.0,
        shouldCorrectPitch: true,
      }
    );

    currentSound = sound;

    // Clean up when playback finishes
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
        currentSound = null;
      }
    });

    console.log('✅ Audio playback started (Data URI method)');
  } catch (error) {
    console.error('❌ Data URI audio playback error:', error);
    throw error;
  }
};

/**
 * Stop currently playing audio
 */
export const stopAudio = async () => {
  try {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
      console.log('✅ Audio stopped');
    }
  } catch (error) {
    console.error('❌ Error stopping audio:', error);
  }
};

/**
 * Set audio mode (important for proper playback)
 */
export const configureAudioMode = async () => {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    console.log('✅ Audio mode configured');
  } catch (error) {
    console.error('❌ Error configuring audio mode:', error);
  }
};

/**
 * Play audio from URL (Supabase Storage)
 * Downloads file first for zero buffering/stuttering
 * @param {string} url - Public URL of audio file
 * @returns {Promise<void>}
 */
export const playAudioFromURL = async (url) => {
  if (!url) {
    console.log('No audio URL provided');
    return;
  }

  try {
    console.log('🎵 Downloading audio from URL:', url);

    // Stop any currently playing audio
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

    // Configure audio mode
    await configureAudioMode();

    // Import FileSystem dynamically
    let FileSystem;
    try {
      FileSystem = require('expo-file-system');
    } catch (e) {
      console.warn('⚠️  FileSystem not available, falling back to direct URL playback');
      // Fallback to direct URL playback
      return await playAudioFromURLDirect(url);
    }

    // Determine target directory
    let targetDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;

    if (!targetDir) {
      console.warn('⚠️  No FileSystem directory available, falling back to direct URL playback');
      return await playAudioFromURLDirect(url);
    }

    // Generate local filename from URL
    const filename = url.split('/').pop().split('?')[0];
    const localUri = `${targetDir}${filename}`;

    console.log('📥 Downloading to local storage...');

    // Download file completely before playing
    const downloadResult = await FileSystem.downloadAsync(url, localUri);

    if (downloadResult.status !== 200) {
      throw new Error(`Download failed with status ${downloadResult.status}`);
    }

    console.log('✅ Download complete, playing from local file');

    // Play from local file (no network streaming = no stuttering!)
    const { sound } = await Audio.Sound.createAsync(
      { uri: localUri },
      {
        shouldPlay: true,
        progressUpdateIntervalMillis: 100,
        isLooping: false,
        volume: 1.0,
        isMuted: false,
        rate: 1.0,
        shouldCorrectPitch: true,
      }
    );

    currentSound = sound;

    // Clean up when playback finishes
    sound.setOnPlaybackStatusUpdate(async (status) => {
      if (status.isLoaded && status.didJustFinish) {
        await sound.unloadAsync();
        currentSound = null;

        // Delete local file after playback
        try {
          await FileSystem.deleteAsync(localUri, { idempotent: true });
          console.log('🗑️  Local file cleaned up');
        } catch (e) {
          console.warn('Could not delete local file:', e);
        }

        console.log('✅ Audio playback finished');
      } else if (status.error) {
        console.error('❌ Playback error:', status.error);
      }
    });

    console.log('✅ Audio playback started from local file');
  } catch (error) {
    console.error('❌ Audio download/playback error:', error);
    // Last resort fallback
    try {
      console.log('🔄 Attempting direct URL playback as fallback...');
      await playAudioFromURLDirect(url);
    } catch (fallbackError) {
      console.error('❌ All playback methods failed:', fallbackError);
    }
  }
};

/**
 * Fallback: Download using fetch then play from base64
 * Used when FileSystem is not available
 * This ensures ZERO stuttering by downloading completely first
 */
const playAudioFromURLDirect = async (url) => {
  try {
    console.log('📥 Downloading audio using fetch (no streaming)...');

    // Fetch the entire file before playing
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get as blob
    const blob = await response.blob();
    console.log(`✅ Downloaded ${Math.round(blob.size / 1024)}KB`);

    // Convert blob to base64
    const reader = new FileReader();

    const base64Promise = new Promise((resolve, reject) => {
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });

    reader.readAsDataURL(blob);
    const base64Audio = await base64Promise;

    console.log('✅ Converted to base64, playing from memory...');

    // Play using optimized base64 method
    const { sound } = await Audio.Sound.createAsync(
      { uri: `data:audio/mpeg;base64,${base64Audio}` },
      {
        shouldPlay: true,
        progressUpdateIntervalMillis: 100,
        isLooping: false,
        volume: 1.0,
        isMuted: false,
        rate: 1.0,
        shouldCorrectPitch: true,
      }
    );

    currentSound = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        currentSound = null;
        console.log('✅ Audio playback finished (fetch+base64)');
      } else if (status.error) {
        console.error('❌ Playback error:', status.error);
      }
    });

    console.log('✅ Audio playback started (fetch+base64, no streaming!)');
  } catch (error) {
    console.error('❌ Fetch download failed:', error);

    // Last resort: try direct URL streaming
    console.log('🔄 Last resort: trying direct URL streaming...');
    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      {
        shouldPlay: true,
        progressUpdateIntervalMillis: 500,
        volume: 1.0,
      }
    );

    currentSound = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        currentSound = null;
        console.log('✅ Audio playback finished (direct stream)');
      }
    });

    console.log('✅ Audio playback started (direct stream)');
  }
};

/**
 * Play audio from WebSocket streaming (Standalone apps)
 * @param {string} wsUrl - WebSocket URL
 * @param {object} data - Data to send to server (e.g., {text: "...", language_code: "ko-KR"})
 * @returns {Promise<void>}
 */
export const playAudioFromWebSocket = async (wsUrl, data) => {
  return new Promise((resolve, reject) => {
    console.log('🔌 Connecting to WebSocket:', wsUrl);

    const ws = new WebSocket(wsUrl);
    const audioChunks = [];
    let isCollecting = true;

    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      ws.send(JSON.stringify(data));
      console.log('📤 Sent data:', data);
    };

    ws.onmessage = async (event) => {
      // Check if it's a text message (completion signal or error)
      if (typeof event.data === 'string') {
        const message = event.data;

        if (message === 'DONE') {
          console.log('✅ WebSocket streaming complete');
          isCollecting = false;

          // Combine all chunks and play
          if (audioChunks.length > 0) {
            try {
              await playCollectedChunks(audioChunks);
              resolve();
            } catch (error) {
              reject(error);
            }
          } else {
            resolve();
          }

          ws.close();
        } else {
          try {
            const errorData = JSON.parse(message);
            if (errorData.error) {
              console.error('❌ Server error:', errorData.error);
              reject(new Error(errorData.error));
              ws.close();
            }
          } catch (e) {
            // Not JSON, might be other text message
            console.log('📨 Server message:', message);
          }
        }
      } else {
        // Binary data (audio chunk)
        if (isCollecting) {
          audioChunks.push(event.data);
          console.log(`📥 Received chunk ${audioChunks.length} (${event.data.size} bytes)`);
        }
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
 * Convert ArrayBuffer to base64
 * @param {ArrayBuffer} buffer - ArrayBuffer to convert
 * @returns {string} base64 string
 */
const arrayBufferToBase64 = (buffer) => {
  const uint8Array = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000; // 32KB chunks to avoid stack overflow

  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, chunk);
  }

  return btoa(binary);
};

/**
 * Play collected audio chunks using FileSystem
 * Helper function that writes to a temporary file
 * @param {string} base64Audio - Base64 encoded audio
 */
const playChunksUsingFileSystem = async (base64Audio) => {
  // Get FileSystem
  let FileSystem;
  try {
    FileSystem = require('expo-file-system');
  } catch (e) {
    console.warn('⚠️  expo-file-system not available');
    throw new Error('expo-file-system module not found');
  }

  // Try multiple directory options
  let targetDir = null;
  if (FileSystem.cacheDirectory) {
    targetDir = FileSystem.cacheDirectory;
    console.log('📁 Using cacheDirectory');
  } else if (FileSystem.documentDirectory) {
    targetDir = FileSystem.documentDirectory;
    console.log('📁 Using documentDirectory');
  } else {
    throw new Error('FileSystem directory not available');
  }

  // Save to temporary file
  const fileUri = `${targetDir}ws_audio_${Date.now()}.mp3`;
  console.log(`💾 Saving to file: ${fileUri}`);

  await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
    encoding: FileSystem.EncodingType.Base64,
  });

  console.log('✅ File saved, creating sound...');

  // Play from file
  const { sound } = await Audio.Sound.createAsync(
    { uri: fileUri },
    { shouldPlay: true }
  );

  currentSound = sound;

  // Clean up when done
  sound.setOnPlaybackStatusUpdate(async (status) => {
    if (status.didJustFinish) {
      console.log('🎵 Playback finished, cleaning up...');
      await sound.unloadAsync();
      try {
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
        console.log('🗑️  Temp file deleted');
      } catch (e) {
        console.warn('Could not delete temp file:', e);
      }
      currentSound = null;
    }
  });

  console.log('✅ WebSocket audio playback started (FileSystem method)!');
};

/**
 * Play collected audio chunks using Data URI
 * Fallback method when FileSystem is not available
 * @param {string} base64Audio - Base64 encoded audio
 */
const playChunksUsingDataURI = async (base64Audio) => {
  console.log('🎵 Using Data URI method for playback...');

  // Create a data URI from base64
  const audioUri = `data:audio/mp3;base64,${base64Audio}`;

  // Play from data URI with optimized settings
  const { sound } = await Audio.Sound.createAsync(
    { uri: audioUri },
    {
      shouldPlay: true,
      progressUpdateIntervalMillis: 100,
      isLooping: false,
      volume: 1.0,
      isMuted: false,
      rate: 1.0,
      shouldCorrectPitch: true,
    }
  );

  currentSound = sound;

  // Clean up when done
  sound.setOnPlaybackStatusUpdate(async (status) => {
    if (status.didJustFinish) {
      console.log('🎵 Playback finished');
      await sound.unloadAsync();
      currentSound = null;
    }
  });

  console.log('✅ WebSocket audio playback started (Data URI method)!');
};

/**
 * Audio chunk queue for streaming playback
 */
let audioQueue = [];
let isPlayingQueue = false;

/**
 * Play audio chunk immediately (streaming)
 * Used for real-time WebSocket streaming
 * @param {ArrayBuffer} chunk - Audio chunk from WebSocket
 */
export const playAudioChunkStreaming = async (chunk) => {
  audioQueue.push(chunk);

  // Start playing if not already playing
  if (!isPlayingQueue) {
    processAudioQueue();
  }
};

/**
 * Process audio queue - plays chunks sequentially
 */
const processAudioQueue = async () => {
  if (isPlayingQueue || audioQueue.length === 0) {
    return;
  }

  isPlayingQueue = true;

  try {
    while (audioQueue.length > 0) {
      const chunk = audioQueue.shift();
      await playChunkNow(chunk);
    }
  } catch (error) {
    console.error('❌ Error processing audio queue:', error);
  } finally {
    isPlayingQueue = false;
  }
};

/**
 * Play a single chunk immediately
 * @param {ArrayBuffer} chunk - Audio chunk
 */
const playChunkNow = async (chunk) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Convert chunk to base64
      const uint8Array = new Uint8Array(chunk);
      let binary = '';
      const chunkSize = 0x8000;

      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const subChunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
        binary += String.fromCharCode.apply(null, subChunk);
      }

      const base64Audio = btoa(binary);

      // Try FileSystem method first
      let FileSystem;
      try {
        FileSystem = require('expo-file-system');
      } catch (e) {
        // Fallback to Data URI
        return await playChunkDataURI(base64Audio, resolve, reject);
      }

      let targetDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
      if (!targetDir) {
        return await playChunkDataURI(base64Audio, resolve, reject);
      }

      const fileUri = `${targetDir}stream_chunk_${Date.now()}.mp3`;

      await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true }
      );

      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          await sound.unloadAsync();
          try {
            await FileSystem.deleteAsync(fileUri, { idempotent: true });
          } catch (e) {
            // Ignore cleanup errors
          }
          resolve();
        } else if (status.error) {
          reject(status.error);
        }
      });

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Play chunk using Data URI (fallback)
 */
const playChunkDataURI = async (base64Audio, resolve, reject) => {
  try {
    const audioUri = `data:audio/mp3;base64,${base64Audio}`;

    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUri },
      { shouldPlay: true }
    );

    sound.setOnPlaybackStatusUpdate(async (status) => {
      if (status.didJustFinish) {
        await sound.unloadAsync();
        resolve();
      } else if (status.error) {
        reject(status.error);
      }
    });
  } catch (error) {
    reject(error);
  }
};

/**
 * Clear audio queue (stop streaming)
 */
export const clearAudioQueue = () => {
  audioQueue = [];
  isPlayingQueue = false;
};

/**
 * Play collected audio chunks
 * Helper function for WebSocket playback
 * @param {Array} chunks - Array of ArrayBuffer chunks from WebSocket
 */
export const playCollectedChunks = async (chunks) => {
  try {
    console.log(`🎵 Playing ${chunks.length} audio chunks`);

    if (!chunks || chunks.length === 0) {
      console.warn('⚠️  No chunks to play');
      return;
    }

    // Stop any currently playing audio
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

    // Configure audio mode
    await configureAudioMode();

    // Calculate total size
    const totalSize = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
    console.log(`📦 Total audio size: ${totalSize} bytes`);

    // Combine all chunks into a single ArrayBuffer
    const combined = new Uint8Array(totalSize);
    let offset = 0;

    for (const chunk of chunks) {
      const uint8 = new Uint8Array(chunk);
      combined.set(uint8, offset);
      offset += uint8.length;
    }

    console.log(`✅ Combined ${chunks.length} chunks into single buffer`);

    // Convert to base64
    const base64Audio = arrayBufferToBase64(combined.buffer);
    console.log(`📦 Converted to base64 (${base64Audio.length} chars)`);

    // Try FileSystem method first, fallback to Data URI
    try {
      await playChunksUsingFileSystem(base64Audio);
    } catch (fileSystemError) {
      // Fallback to Data URI (silently)
      try {
        await playChunksUsingDataURI(base64Audio);
      } catch (dataUriError) {
        console.error('❌ Audio playback failed:', dataUriError);
        throw dataUriError;
      }
    }
  } catch (error) {
    console.error('❌ Error playing collected chunks:', error);
    throw error;
  }
};

/**
 * Smart audio playback - automatically chooses the best method
 * @param {object} audioData - Can contain audio_url, audio (base64), or websocket config
 * @returns {Promise<void>}
 */
export const playAudio = async (audioData) => {
  if (!audioData) {
    console.log('No audio data provided');
    return;
  }

  // Priority 1: URL (Expo Go)
  if (audioData.audio_url) {
    await playAudioFromURL(audioData.audio_url);
    return;
  }

  // Priority 2: Base64
  if (audioData.audio) {
    await playAudioFromBase64(audioData.audio);
    return;
  }

  console.warn('⚠️  No playable audio data found');
};

