/**
 * AR Screen - Expo Camera Version
 * Main AR experience with docent interaction
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Alert,
} from 'react-native';
import ARSceneComponent from '../components/ARScene';
import DocentDialog from '../components/DocentDialog';
import { getCurrentUser } from '../utils/supabase';
import { getDocentMessage, getDocentMessageWS, addPoints } from '../api/fastapi';
import { playAudioFromBase64, playAudioFromURL, playAudioChunkStreaming, clearAudioQueue, configureAudioMode, isExpoGo } from '../utils/audio';

const ARScreen = ({ route, navigation }) => {
  const { quest } = route.params || {};
  const [showDialog, setShowDialog] = useState(false);
  const [docentMessage, setDocentMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [hasConversed, setHasConversed] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // TTS 음소거 상태 (전체 화면에서 유지)

  useEffect(() => {
    // Configure audio mode on mount
    configureAudioMode();

    loadUser();
    if (quest) {
      loadInitialMessage();
    }
  }, [quest]);

  const loadUser = async () => {
    const user = await getCurrentUser();
    if (user) {
      setUserId(user.id);
    }
  };

  const loadInitialMessage = async () => {
    if (!quest) return;

    try {
      const user = await getCurrentUser();
      if (!user) return;

      const useExpoGo = isExpoGo();

      if (useExpoGo) {
        // Expo Go: Use REST API with URL
        console.log(`📡 Loading initial message via REST API (Expo Go) - Text only (no TTS for initial)`);

        const response = await getDocentMessage(user.id, quest.name, null, 'ko', false);
        setDocentMessage(response.message);
        setShowDialog(true);
        setHasConversed(true);

        // Initial message: no audio playback (text only)
        console.log('📝 Initial message loaded - text only (no TTS)');
      } else {
        // Standalone: Use WebSocket streaming
        console.log(`🔌 Loading initial message via WebSocket - Text only (no TTS for initial)`);

        const response = await getDocentMessageWS(
          user.id,
          quest.name,
          null,
          'ko',
          // Text received callback
          (data) => {
            console.log('📨 Initial message received');
            setDocentMessage(data.message);
            setShowDialog(true);
            setHasConversed(true);
          },
          // Audio chunk received callback - not used for initial message
          null,
          false  // enable_tts = false for initial message
        );

        console.log('✅ Initial message WebSocket streaming complete');
      }
    } catch (error) {
      console.error('Error loading initial message:', error);
    }
  };

  const handleCameraReady = () => {
    console.log('Camera ready');
  };

  const handleMessageReceived = (response) => {
    setDocentMessage(response.message);
    setHasConversed(true); // Mark that user has conversed with docent
    // Audio is already handled in DocentDialog
  };

  const toggleDialog = () => {
    // Check if quest exists
    if (!quest) {
      Alert.alert(
        '안내',
        '퀘스트를 먼저 진행해주세요!',
        [
          {
            text: '확인',
            onPress: () => navigation.navigate('Quest'),
          },
        ]
      );
      return;
    }

    setShowDialog(!showDialog);
  };

  const handleExploreComplete = async () => {
    // Check if quest exists
    if (!quest) {
      Alert.alert(
        '안내',
        '퀘스트를 먼저 진행해주세요!',
        [
          {
            text: '확인',
            onPress: () => navigation.navigate('Quest'),
          },
        ]
      );
      return;
    }

    // Check if user has conversed with docent first
    if (!hasConversed) {
      Alert.alert('안내', '도슨트와 대화를 먼저 진행해주세요');
      return;
    }

    if (!userId) {
      Alert.alert('오류', '사용자 정보를 불러올 수 없습니다.');
      return;
    }

    try {
      // Add points to user
      const points = quest.reward_point || 100; // Use quest's reward_point or default 100
      const result = await addPoints(userId, points, `${quest.name} 탐험 완료`);

      console.log('✅ Points added successfully:', result);

      Alert.alert(
        '🎉 탐험 완료!',
        `${quest.name} 탐험을 완료했습니다!\n${points} 포인트를 획득했습니다.`,
        [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error completing quest:', error);
      console.error('Error details:', error.response?.data || error.message);
      Alert.alert(
        '오류',
        `포인트 적립 중 오류가 발생했습니다.\n${error.response?.data?.detail || error.message}`
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* AR Scene with Camera */}
      <View style={styles.arContainer}>
        <ARSceneComponent
          onCameraReady={handleCameraReady}
          docentMessage={showDialog ? null : docentMessage}
          onExploreComplete={handleExploreComplete}
        />
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleDialog}>
          <Text style={styles.controlButtonText}>
            {showDialog ? '💬 대화 닫기' : '💬 도슨트와 대화'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.controlButtonText}>← 뒤로</Text>
        </TouchableOpacity>
      </View>

      {/* Docent Dialog */}
      {showDialog && userId && quest && (
        <View style={styles.dialogContainer}>
          <DocentDialog
            userId={userId}
            landmark={quest.name}
            onMessageReceived={handleMessageReceived}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  arContainer: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  backButton: {
    backgroundColor: 'rgba(107, 114, 128, 0.9)',
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dialogContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
});

export default ARScreen;
