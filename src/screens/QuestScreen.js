/**
 * Quest Screen - Expo Location Version
 * Shows map with quest markers and allows quest selection
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, SafeAreaView } from 'react-native';
import * as Location from 'expo-location';
// import QuestMap from '../components/QuestMap';
import QuestList from '../components/QuestList';
import TabBar from '../components/TabBar';

const QuestScreen = ({ navigation }) => {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

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
});

export default QuestScreen;
