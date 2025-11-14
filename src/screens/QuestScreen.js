import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, SafeAreaView, Text, TouchableOpacity, ScrollView, Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import QuestList from '../components/QuestList';
import TabBar from '../components/TabBar';
import * as Colors from '../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/spacing';

const QuestScreen = ({ navigation, route }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const selectedQuestFromHome = route?.params?.selectedQuest;

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (selectedQuestFromHome) {
      setShowDetail(true);
    }
  }, [selectedQuestFromHome]);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: '위치 권한 요청',
            message: 'Quest of Seoul 앱에서 현재 위치를 사용하려고 합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '거부',
            buttonPositive: '허용',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            '위치 권한 필요',
            '퀘스트를 찾기 위해 위치 권한이 필요합니다.',
            [{ text: '확인' }]
          );
          setUserLocation({
            latitude: 37.5665,
            longitude: 126.9780,
          });
          return;
        }
      }

      getCurrentLocation();
    } catch (err) {
      console.error('Error requesting location permission:', err);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        setUserLocation({
          latitude: 37.5665,
          longitude: 126.9780,
        });
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
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

  if (showDetail && selectedQuestFromHome) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.detailContainer}>
          <View style={styles.detailHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowDetail(false)}
            >
              <Text style={styles.backButtonText}>← 목록으로</Text>
            </TouchableOpacity>
            <Text style={styles.detailTitle}>{selectedQuestFromHome.name}</Text>
          </View>

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
          onQuestPress={() => { }}
          onARPress={navigateToAR}
          onRewardPress={navigateToRewards}
          onMyPress={navigateToMy}
        />
      </SafeAreaView>
    );
  }

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
        onQuestPress={() => { }}
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
    backgroundColor: Colors.GRAY_50,
  },
  content: {
    flex: 1,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_LIGHT,
  },
  detailHeader: {
    backgroundColor: Colors.SECONDARY,
    padding: SPACING.xl,
    paddingTop: SPACING.md,
  },
  backButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  backButtonText: {
    color: Colors.TEXT_WHITE,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
  detailTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.TEXT_WHITE,
  },
  detailCard: {
    backgroundColor: Colors.BACKGROUND_WHITE,
    margin: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    shadowColor: Colors.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailCategory: {
    fontSize: FONT_SIZE.lg,
    color: Colors.PRIMARY,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.lg,
  },
  detailInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.xl,
  },
  detailInfoItem: {
    alignItems: 'center',
  },
  detailInfoLabel: {
    fontSize: FONT_SIZE.xs,
    color: Colors.TEXT_MUTED,
    marginBottom: 4,
  },
  detailInfoValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.TEXT_PRIMARY,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.BORDER_LIGHT,
    marginVertical: SPACING.lg,
  },
  detailSectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.TEXT_PRIMARY,
    marginBottom: SPACING.sm,
  },
  detailAddress: {
    fontSize: FONT_SIZE.sm,
    color: Colors.TEXT_MUTED,
    lineHeight: 20,
  },
  detailOverview: {
    fontSize: FONT_SIZE.sm,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 22,
  },
  arButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.xl,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  arButtonText: {
    color: Colors.TEXT_WHITE,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
});

export default QuestScreen;
