/**
 * Quest Screen - Expo Location Version
 * Shows map with quest markers and allows quest selection
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, SafeAreaView, Text, TouchableOpacity, ScrollView } from 'react-native';
import * as Location from 'expo-location';
// import QuestMap from '../components/QuestMap';
import QuestList from '../components/QuestList';
import TabBar from '../components/TabBar';

const QuestScreen = ({ navigation, route }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const selectedQuestFromHome = route?.params?.selectedQuest;

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    // Show detail view if quest was selected from HomeScreen
    if (selectedQuestFromHome) {
      setShowDetail(true);
    }
  }, [selectedQuestFromHome]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          '위치 권한 필요',
          '퀘스트를 찾기 위해 위치 권한이 필요합니다.',
          [{ text: '확인' }]
        );
        // Default to Seoul City Hall
        setUserLocation({
          latitude: 37.5665,
          longitude: 126.9780,
        });
        return;
      }

      getCurrentLocation();
    } catch (err) {
      console.error('Error requesting location permission:', err);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      // Default to Seoul City Hall
      setUserLocation({
        latitude: 37.5665,
        longitude: 126.9780,
      });
    }
  };

  const handleQuestSelected = (quest) => {
    Alert.alert(
      '퀘스트 시작',
      `${quest.name} 퀘스트를 시작하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: 'AR 보기',
          onPress: () => {
            navigation.navigate('AR', { quest });
          },
        },
      ]
    );
  };

  const navigateToHome = () => {
    navigation.navigate('Home');
  };

  const navigateToAR = () => {
    navigation.navigate('AR');
  };

  const navigateToRewards = () => {
    navigation.navigate('Reward');
  };

  const navigateToMy = () => {
    navigation.navigate('My');
  };

  // Quest Detail View
  if (showDetail && selectedQuestFromHome) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.detailContainer}>
          {/* Header */}
          <View style={styles.detailHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowDetail(false)}
            >
              <Text style={styles.backButtonText}>← 목록으로</Text>
            </TouchableOpacity>
            <Text style={styles.detailTitle}>{selectedQuestFromHome.name}</Text>
          </View>

          {/* Quest Info Card */}
          <View style={styles.detailCard}>
            <Text style={styles.detailCategory}>
              📍 {selectedQuestFromHome.category}
            </Text>

            <View style={styles.detailInfoRow}>
              <View style={styles.detailInfoItem}>
                <Text style={styles.detailInfoLabel}>거리</Text>
                <Text style={styles.detailInfoValue}>
                  {selectedQuestFromHome.distanceKm?.toFixed(1) || 'N/A'} km
                </Text>
              </View>
              <View style={styles.detailInfoItem}>
                <Text style={styles.detailInfoLabel}>리워드</Text>
                <Text style={styles.detailInfoValue}>
                  {selectedQuestFromHome.rewardPoint || 0} P
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.detailSectionTitle}>📍 위치</Text>
            <Text style={styles.detailAddress}>
              {selectedQuestFromHome.address || '주소 정보 없음'}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.detailSectionTitle}>📖 설명</Text>
            <Text style={styles.detailOverview}>
              {selectedQuestFromHome.overview || '설명이 없습니다.'}
            </Text>

            {/* AR Button */}
            <TouchableOpacity
              style={styles.arButton}
              onPress={() => {
                navigation.navigate('AR', {
                  quest: selectedQuestFromHome
                });
              }}
            >
              <Text style={styles.arButtonText}>AR 모드로 보기</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <TabBar
          activeTab="quest"
          onHomePress={navigateToHome}
          onQuestPress={() => {}}
          onARPress={navigateToAR}
          onRewardPress={navigateToRewards}
          onMyPress={navigateToMy}
        />
      </SafeAreaView>
    );
  }

  // Quest List View (default)
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <QuestList
          onQuestSelected={handleQuestSelected}
        />
      </View>

      <TabBar
        activeTab="quest"
        onHomePress={navigateToHome}
        onQuestPress={() => {}}
        onARPress={navigateToAR}
        onRewardPress={navigateToRewards}
        onMyPress={navigateToMy}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
  },
  // Detail View Styles
  detailContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  detailHeader: {
    backgroundColor: '#6366f1',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  detailCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailCategory: {
    fontSize: 16,
    color: '#f97316',
    fontWeight: '600',
    marginBottom: 16,
  },
  detailInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  detailInfoItem: {
    alignItems: 'center',
  },
  detailInfoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  detailInfoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  detailAddress: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  detailOverview: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  arButton: {
    backgroundColor: '#f97316',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  arButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuestScreen;
