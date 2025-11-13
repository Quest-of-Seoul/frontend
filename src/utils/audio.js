import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';

Sound.setCategory('Playback');

let currentSound = null;

export const configureAudioMode = () => {
  try {
    Sound.setCategory('Playback', true);
  } catch (error) {
    console.error('Error configuring audio mode:', error);
  }
};

export const stopAudio = () => {
  try {
    if (currentSound) {
      currentSound.stop(() => {
        currentSound.release();
        currentSound = null;
      });
    }
  } catch (error) {
    console.error('Error stopping audio:', error);
  }
};

const playAudioFromBase64 = async (base64Audio) => {
  if (!base64Audio) {
    return;
  }

  try {
    const tempFilePath = `${RNFS.CachesDirectoryPath}/audio_${Date.now()}.mp3`;

    await RNFS.writeFile(tempFilePath, base64Audio, 'base64');

    await playAudioFromFile(tempFilePath);

    try {
      await RNFS.unlink(tempFilePath);
    } catch (cleanupError) {
      console.error('Could not delete temp file:', cleanupError);
    }
  } catch (error) {
    console.error('Error playing audio from base64:', error);
    throw error;
  }
};

const playAudioFromFile = (filePath) => {
  return new Promise((resolve, reject) => {
    if (currentSound) {
      currentSound.stop(() => {
        currentSound.release();
        currentSound = null;
      });
    }

    const sound = new Sound(filePath, '', (error) => {
      if (error) {
        console.error('Failed to load audio:', error);
        reject(error);
        return;
      }

      sound.play((success) => {
        if (!success) {
          console.error('Audio playback failed');
        }

        sound.release();
        currentSound = null;
        resolve();
      });

      currentSound = sound;
    });
  });
};

const arrayBufferToBase64 = (buffer) => {
  const uint8Array = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;

  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, chunk);
  }

  return btoa(binary);
};

let audioQueue = [];
let isPlayingQueue = false;

export const playAudioChunkStreaming = async (chunk) => {
  audioQueue.push(chunk);

  if (!isPlayingQueue) {
    processAudioQueue();
  }
};

const processAudioQueue = async () => {
  if (isPlayingQueue || audioQueue.length === 0) {
    return;
  }

  isPlayingQueue = true;

  try {
    while (audioQueue.length > 0) {
      const chunk = audioQueue.shift();
      const base64 = arrayBufferToBase64(chunk);
      await playAudioFromBase64(base64);
    }
  } catch (error) {
    console.error('Error processing audio queue:', error);
  } finally {
    isPlayingQueue = false;
  }
};

export const clearAudioQueue = () => {
  audioQueue = [];
  isPlayingQueue = false;
};
