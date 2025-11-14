import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Alert,
  Modal,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ARSceneComponent from '../components/ARScene';
import DocentDialog from '../components/DocentDialog';
import { getCurrentUser } from '../utils/supabase';
import { getDocentMessageWS, addPoints } from '../api/fastapi';
import { configureAudioMode } from '../utils/audio';
import * as Colors from '../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/spacing';
import { shadows } from '../utils/theme';

const ARScreen = ({ route, navigation }) => {
  const { quest } = route.params || {};
  const [showDialog, setShowDialog] = useState(false);
  const [docentMessage, setDocentMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [hasConversed, setHasConversed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0); // TTS 음소거 상태 (전체 화면에서 유지)

  useEffect(() => {
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

      const response = await getDocentMessageWS(
        user.id,
        quest.name,
        null,
        'ko',
        (data) => {
          setDocentMessage(data.message);
          setShowDialog(true);
          setHasConversed(true);
        },
        null,
        false
      );
    } catch (error) {
      console.error('초기 메시지 로딩 에러:', error);
    }
  };

  const handleCameraReady = () => {
    // Camera ready
  };

  const handleMessageReceived = (response) => {
    setDocentMessage(response.message);
    setHasConversed(true); // Mark that user has conversed with docent
  };

  const toggleDialog = () => {
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

    if (!hasConversed) {
      Alert.alert('안내', '도슨트와 대화를 먼저 진행해주세요');
      return;
    }

    if (!userId) {
      Alert.alert('오류', '사용자 정보를 불러올 수 없습니다.');
      return;
    }

    try {
      const points = quest.reward_point || 100;
      const result = await addPoints(userId, points, `${quest.name} 탐험 완료`);

      setEarnedPoints(points);
      setShowCompletionModal(true);
    } catch (error) {
      console.error('Error completing quest:', error);
      console.error('Error details:', error.response?.data || error.message);
      Alert.alert(
        '오류',
        `포인트 적립 중 오류가 발생했습니다.\n${error.response?.data?.detail || error.message}`
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.arContainer}>
        <ARSceneComponent
          onCameraReady={handleCameraReady}
          docentMessage={showDialog ? null : docentMessage}
          onExploreComplete={handleExploreComplete}
        />
      </View>

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

      <Modal
        visible={showCompletionModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowCompletionModal(false);
          navigation.goBack();
        }}
      >
        <LinearGradient
          colors={[Colors.GRADIENT_START, Colors.GRADIENT_MIDDLE, Colors.GRADIENT_END]}
          style={styles.completionModal}
        >
          <View style={styles.completionContent}>
            <Text style={styles.completionTitle}>🎉 Quest Completed!</Text>

            <View style={styles.landmarkCard}>
              <Image
                source={require('../../assets/ai_docent.png')}
                style={styles.landmarkImage}
                resizeMode="cover"
              />
              <Text style={styles.landmarkName}>{quest?.title || quest?.name}</Text>
            </View>

            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>+{earnedPoints} P</Text>
            </View>

            <TouchableOpacity
              style={styles.completionButton}
              onPress={() => {
                setShowCompletionModal(false);
                navigation.goBack();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.completionButtonText}>완료</Text>
            </TouchableOpacity>
          </View>

          <Image
            source={require('../../assets/ai_docent.png')}
            style={styles.tigerCharacter}
            resizeMode="contain"
          />
        </LinearGradient>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.GRAY_900,
  },
  arContainer: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    top: 60,
    left: SPACING.xl,
    right: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    backgroundColor: Colors.SECONDARY + 'E6',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    ...shadows.medium,
  },
  backButton: {
    backgroundColor: Colors.GRAY_600 + 'E6',
  },
  controlButtonText: {
    color: Colors.TEXT_WHITE,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
  },
  dialogContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: Colors.BACKGROUND_WHITE,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    ...shadows.large,
  },
  completionModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxxl + 8,
  },
  completionContent: {
    alignItems: 'center',
    width: '100%',
  },
  completionTitle: {
    fontSize: 48,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.PRIMARY,
    marginBottom: SPACING.xxxl + 8,
    textAlign: 'center',
  },
  landmarkCard: {
    backgroundColor: Colors.BACKGROUND_WHITE,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '80%',
    ...shadows.large,
    marginBottom: SPACING.xxxl - 2,
  },
  landmarkImage: {
    width: 200,
    height: 200,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  landmarkName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.semibold,
    color: Colors.TEXT_PRIMARY,
    textAlign: 'center',
  },
  pointsBadge: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: SPACING.xxxl - 2,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xxxl,
    marginBottom: SPACING.xxxl + 8,
    ...shadows.medium,
  },
  pointsText: {
    fontSize: FONT_SIZE.heading,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.TEXT_WHITE,
  },
  completionButton: {
    backgroundColor: Colors.BACKGROUND_WHITE,
    paddingHorizontal: SPACING.xxxl * 2,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xxxl,
    ...shadows.medium,
  },
  completionButtonText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.TEXT_PRIMARY,
  },
  tigerCharacter: {
    position: 'absolute',
    bottom: 50,
    right: SPACING.xl,
    width: 150,
    height: 150,
  },
});

export default ARScreen;
