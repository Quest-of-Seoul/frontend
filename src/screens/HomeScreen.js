/**
 * Home Screen
 * Main landing screen with navigation to features
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { getCurrentUser, signOut } from '../utils/supabase';
import { getUserPoints, getNearbyQuests } from '../api/fastapi';
import { calculateDistance, getWalkingRoute } from '../utils/navigation';
import TabBar from '../components/TabBar';
import SimpleKakaoMap from '../components/SimpleKakaoMap';

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);

  // UI state for new home layout
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [placeModalVisible, setPlaceModalVisible] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Map state
  const [currentLocation, setCurrentLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.5665, // Seoul City Hall
    longitude: 126.9780,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [quests, setQuests] = useState([]);
  const webViewRef = useRef(null);

  // Load user data once on mount
  useEffect(() => {
    loadUserData();
    requestLocationPermission();

    // 🧪 테스트: 서울 시청 위치로 퀘스트 가져오기 (위치 상관없이)
    fetchNearbyQuests(37.5665, 126.9780);
  }, []);

  // Request location permission and watch location in real-time
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        // 초기 위치 가져오기
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        setCurrentLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });

        console.log('📍 Initial location:', latitude, longitude);

        // 실시간 위치 추적 시작
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 2000, // 2초마다 업데이트 (빠른 반응)
            distanceInterval: 5, // 5미터 이동 시 업데이트 (민감하게)
          },
          (newLocation) => {
            const { latitude, longitude } = newLocation.coords;
            console.log('🔄 Location updated:', latitude, longitude);

            setCurrentLocation({ latitude, longitude });
            setRegion({
              latitude,
              longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            });

            // 위치 변경 시 주변 퀘스트 다시 가져오기
            fetchNearbyQuests(latitude, longitude);
          }
        );

        // 초기 퀘스트 로드
        fetchNearbyQuests(latitude, longitude);

        // Cleanup: 컴포넌트 언마운트 시 구독 해제
        return () => {
          subscription.remove();
        };
      } else {
        console.log('⚠️ Location permission denied');
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  // Refresh points whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 HomeScreen focused - refreshing points');
      refreshPoints();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();

      console.log('📱 Current User:', currentUser); // 디버그

      setUser(currentUser);

      if (currentUser && currentUser.id) {
        console.log('📡 Fetching points for user:', currentUser.id);
        try {
          const pointsData = await getUserPoints(currentUser.id);
          console.log('✅ Points data:', pointsData);
          setPoints(pointsData.total_points);
        } catch (error) {
          console.error('❌ Error fetching points:', error.response?.data || error.message);
          // 게스트 모드나 에러 시 포인트 0으로 유지
          setPoints(0);
        }
      } else {
        console.log('⚠️ Guest mode - no user ID');
        setPoints(0);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUser(null);
      setPoints(0);
    }
  };

  const refreshPoints = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser && currentUser.id) {
        const pointsData = await getUserPoints(currentUser.id);
        console.log('🔄 Points refreshed:', pointsData.total_points);
        setPoints(pointsData.total_points);
      }
    } catch (error) {
      console.error('❌ Error refreshing points:', error);
    }
  };

  // 주변 퀘스트 가져오기
  const fetchNearbyQuests = async (latitude, longitude) => {
    try {
      console.log('🔍 Fetching nearby quests:', latitude, longitude);
      const nearbyQuests = await getNearbyQuests(latitude, longitude, 50.0); // 50km 반경 (테스트용)
      console.log('✅ Nearby quests:', nearbyQuests);

      // 퀘스트가 없으면 테스트용 Mock 데이터 사용 (현재 위치 주변 200-800m)
      if (!nearbyQuests.quests || nearbyQuests.quests.length === 0) {
        console.log('⚠️ No quests from API, using mock data near current location');

        // 현재 위치 주변에 랜덤 마커 생성 (100m ~ 500m 반경)
        const mockQuests = [
          {
            quest_id: 1,
            title: '테스트 퀘스트 1',
            latitude: latitude + 0.0015, // 약 165m 북쪽
            longitude: longitude + 0.0010, // 약 100m 동쪽
            category: 'Heritage',
            distance_km: 0.2,
            reward_point: 300,
            address: '주변 장소 1',
            description: '현재 위치 근처 테스트 퀘스트입니다.',
          },
          {
            quest_id: 2,
            title: '테스트 퀘스트 2',
            latitude: latitude - 0.0020, // 약 220m 남쪽
            longitude: longitude + 0.0015, // 약 150m 동쪽
            category: 'Landmark',
            distance_km: 0.3,
            reward_point: 250,
            address: '주변 장소 2',
            description: '현재 위치 근처 테스트 퀘스트입니다.',
          },
          {
            quest_id: 3,
            title: '테스트 퀘스트 3',
            latitude: latitude + 0.0025, // 약 275m 북쪽
            longitude: longitude - 0.0010, // 약 100m 서쪽
            category: 'Shopping',
            distance_km: 0.3,
            reward_point: 200,
            address: '주변 장소 3',
            description: '현재 위치 근처 테스트 퀘스트입니다.',
          },
          {
            quest_id: 4,
            title: '테스트 퀘스트 4',
            latitude: latitude - 0.0010, // 약 110m 남쪽
            longitude: longitude - 0.0020, // 약 200m 서쪽
            category: 'Food',
            distance_km: 0.2,
            reward_point: 150,
            address: '주변 장소 4',
            description: '현재 위치 근처 테스트 퀘스트입니다.',
          },
          {
            quest_id: 5,
            title: '테스트 퀘스트 5',
            latitude: latitude + 0.0030, // 약 330m 북쪽
            longitude: longitude + 0.0020, // 약 200m 동쪽
            category: 'Culture',
            distance_km: 0.4,
            reward_point: 400,
            address: '주변 장소 5',
            description: '현재 위치 근처 테스트 퀘스트입니다.',
          },
          {
            quest_id: 6,
            title: '테스트 퀘스트 6',
            latitude: latitude + 0.0008, // 약 88m 북쪽
            longitude: longitude + 0.0008, // 약 80m 동쪽
            category: 'Culture',
            distance_km: 0.1,
            reward_point: 100,
            address: '주변 장소 6',
            description: '아주 가까운 테스트 퀘스트입니다.',
          },
        ];
        console.log('📍 Generated mock quests around:', latitude, longitude);
        setQuests(mockQuests);
      } else {
        setQuests(nearbyQuests.quests || []);
      }
    } catch (error) {
      console.error('❌ Error fetching nearby quests:', error);

      // API 에러 시에도 현재 위치 주변 Mock 데이터 표시
      console.log('⚠️ API error, using mock data near current location');
      const mockQuests = [
        {
          quest_id: 1,
          title: '테스트 퀘스트 1',
          latitude: latitude + 0.0015,
          longitude: longitude + 0.0010,
          category: 'Heritage',
          distance_km: 0.2,
          reward_point: 300,
          address: '주변 장소 1',
          description: '현재 위치 근처 테스트 퀘스트입니다.',
        },
        {
          quest_id: 2,
          title: '테스트 퀘스트 2',
          latitude: latitude - 0.0020,
          longitude: longitude + 0.0015,
          category: 'Landmark',
          distance_km: 0.3,
          reward_point: 250,
          address: '주변 장소 2',
          description: '현재 위치 근처 테스트 퀘스트입니다.',
        },
        {
          quest_id: 3,
          title: '테스트 퀘스트 3',
          latitude: latitude + 0.0025,
          longitude: longitude - 0.0010,
          category: 'Shopping',
          distance_km: 0.3,
          reward_point: 200,
          address: '주변 장소 3',
          description: '현재 위치 근처 테스트 퀘스트입니다.',
        },
        {
          quest_id: 4,
          title: '테스트 퀘스트 4',
          latitude: latitude - 0.0010,
          longitude: longitude - 0.0020,
          category: 'Food',
          distance_km: 0.2,
          reward_point: 150,
          address: '주변 장소 4',
          description: '현재 위치 근처 테스트 퀘스트입니다.',
        },
        {
          quest_id: 5,
          title: '테스트 퀘스트 5',
          latitude: latitude + 0.0030,
          longitude: longitude + 0.0020,
          category: 'Culture',
          distance_km: 0.4,
          reward_point: 400,
          address: '주변 장소 5',
          description: '현재 위치 근처 테스트 퀘스트입니다.',
        },
        {
          quest_id: 6,
          title: '테스트 퀘스트 6',
          latitude: latitude + 0.0008,
          longitude: longitude + 0.0008,
          category: 'Culture',
          distance_km: 0.1,
          reward_point: 100,
          address: '주변 장소 6',
          description: '아주 가까운 테스트 퀘스트입니다.',
        },
      ];
      setQuests(mockQuests);
    }
  };

  const navigateToQuests = (questData = null) => {
    if (questData) {
      navigation.navigate('Quest', { selectedQuest: questData });
    } else {
      navigation.navigate('Quest');
    }
  };

  const navigateToAR = () => {
    navigation.navigate('AR');
  };

  const navigateToRewards = () => {
    navigation.navigate('Reward');
  };

  const navigateToMy = () => {
    // 유지보수: 마이 페이지 라우트가 없다면 안전하게 안내
    try {
      navigation.navigate('My');
    } catch (e) {
      Alert.alert('안내', '마이 페이지는 준비 중입니다.');
    }
  };

  // 퀘스트 마커 클릭 핸들러
  const handleQuestMarkerPress = (quest) => {
    console.log('🎯 Quest marker pressed:', quest);
    setSelectedPlace({
      name: quest.title || quest.name,
      category: quest.category || 'Quest',
      distanceKm: quest.distance_km || 0,
      rewardPoint: quest.reward_point || 0,
      address: quest.address || quest.location,
      overview: quest.description || quest.overview || '',
      questId: quest.quest_id || quest.id,
      latitude: quest.latitude || quest.lat,
      longitude: quest.longitude || quest.lon,
    });
    setPlaceModalVisible(true);
  };

  // 네비게이션 시작 핸들러 - 거리 계산 후 앱 내 경로 표시
  const handleStartNavigation = async () => {
    if (!currentLocation) {
      Alert.alert('위치 정보 없음', '현재 위치를 확인할 수 없습니다.');
      return;
    }

    if (!selectedPlace?.latitude || !selectedPlace?.longitude) {
      Alert.alert('오류', '퀘스트 위치 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      // 1. 거리 계산
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        selectedPlace.latitude,
        selectedPlace.longitude
      );

      console.log(`📏 Distance to quest: ${distance.toFixed(2)} km`);

      // 2. 거리에 따른 처리
      if (distance > 1.0) {
        // 1km 이상이면 "너무 멀어요" 모달
        Alert.alert(
          '너무 멀어요 😅',
          `목적지까지 ${distance.toFixed(2)}km 입니다.\n1km 이내의 퀘스트를 선택해주세요!`,
          [{ text: '확인', style: 'default' }]
        );
      } else {
        // 1km 이내이면 바로 경로 가져오기
        try {
          console.log('🚶 Starting walking quest...');

          // 3. Kakao Mobility API로 경로 가져오기
          const routeData = await getWalkingRoute(
            currentLocation.latitude,
            currentLocation.longitude,
            selectedPlace.latitude,
            selectedPlace.longitude
          );

          console.log(`✅ Route received: ${routeData.coordinates.length} points`);
          console.log(`📏 Distance: ${routeData.distance}m, Duration: ${routeData.duration}s`);

          // 4. 지도에 경로 그리기
          if (webViewRef.current && webViewRef.current.drawRoute) {
            webViewRef.current.drawRoute(routeData.coordinates);
            setPlaceModalVisible(false);

            // 간단한 토스트 메시지
            Alert.alert(
              '걷기 퀘스트 시작! 🚶',
              `거리: ${routeData.distance}m · 예상 시간: ${Math.ceil(routeData.duration / 60)}분`,
              [{ text: '확인' }]
            );
          } else {
            console.error('❌ Map ref not available');
            Alert.alert('오류', '지도를 사용할 수 없습니다.');
          }
        } catch (routeError) {
          console.error('❌ Route error:', routeError);
          Alert.alert('경로 조회 실패', routeError.message || '경로를 가져올 수 없습니다.');
        }
      }
    } catch (error) {
      console.error('❌ Navigation error:', error);
      Alert.alert('오류', '거리 계산에 실패했습니다.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top: Title, Logout, Search */}
      <View style={styles.topArea}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Quest of Seoul</Text>
          {user && (
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.subtitle}>AI AR 도슨트와 함께하는 서울 탐험</Text>

        {/* 현재 위치 좌표 표시 */}
        {currentLocation && (
          <Text style={styles.locationCoords}>
            📍 현재 위치: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
          </Text>
        )}

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search places, quests, or areas..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => Alert.alert('안내', '필터 준비 중입니다.')}
          >
            <Text style={styles.filterIcon}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Category chips with filter button */}
        <View style={styles.chipsRowContainer}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {['All', 'Heritage', 'Cuisine', 'Shopping', 'K-culture'].map((label) => (
              <TouchableOpacity
                key={label}
                onPress={() => setSelectedCategory(label)}
                style={[styles.chip, selectedCategory === label && styles.chipActive]}
              >
                <Text style={[styles.chipText, selectedCategory === label && styles.chipTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* User points compact card */}
        {user && (
          <View style={styles.pointsCompact}>
            <Text style={styles.pointsCompactLabel}>보유 포인트</Text>
            <Text style={styles.pointsCompactValue}>{points} P</Text>
          </View>
        )}
      </View>

      {/* Middle: Map area with Kakao Map */}
      <View style={styles.mapArea}>
        <SimpleKakaoMap
          ref={webViewRef}
          latitude={currentLocation?.latitude || region.latitude}
          longitude={currentLocation?.longitude || region.longitude}
          quests={quests}
          onMarkerPress={handleQuestMarkerPress}
          style={styles.map}
        />
      </View>

      {/* Bottom Sheet Modal for place info */}
      <Modal visible={placeModalVisible} transparent animationType="slide" onRequestClose={() => setPlaceModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalCategory}>{selectedPlace?.category}</Text>
              <TouchableOpacity onPress={() => setPlaceModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalTitle}>{selectedPlace?.name}</Text>
            <Text style={styles.modalMeta}>{selectedPlace?.address}</Text>
            <View style={styles.modalBadges}>
              <Text style={styles.badge}>{selectedPlace ? `${selectedPlace.distanceKm}km` : ''}</Text>
              <Text style={styles.badgeBlue}>{selectedPlace ? `${selectedPlace.rewardPoint} P` : ''}</Text>
            </View>
            <Text style={styles.modalOverview} numberOfLines={3}>
              {selectedPlace?.overview}
            </Text>

            {/* Button Row */}
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={handleStartNavigation}
              >
                <Text style={styles.navigationButtonText}>📍 길찾기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => {
                  setPlaceModalVisible(false);
                  navigateToQuests(selectedPlace);
                }}
              >
                <Text style={styles.detailButtonText}>상세 보기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} transparent animationType="fade" onRequestClose={() => setFilterModalVisible(false)}>
        <LinearGradient
          colors={['rgba(243, 247, 255, 0.5)', 'rgba(243, 247, 255, 1)']}
          style={styles.filterOverlay}
        >
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filter</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Text style={styles.filterClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>Choose Anything You Want</Text>
            <Text style={styles.tipSubtitle}>
              아래에 내가 준비한 테마들 중에서 골라보면 재미있는 여행지를 추천해줄게
            </Text>
          </View>

          {/* 캐릭터 */}
          <View style={styles.characterBox}>
            <Image
              source={require('../../assets/ai_docent.png')}
              style={styles.characterImage}
              resizeMode="contain"
            />
          </View>

          {/* 카테고리 버튼 */}
          <ScrollView style={styles.categoryScrollView} contentContainerStyle={styles.categoryScrollContent}>
            <View style={styles.categoryContainer}>
              {['Heritage', 'Cuisine', 'Shopping', 'K-culture', 'Healing', 'Art', 'Romantic', 'Walk', 'Faith', 'Nearest Trip', 'Most Rewarded', 'Newest'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.categoryChip}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setFilterModalVisible(false);
                  }}
                >
                  <Text style={styles.categoryText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </LinearGradient>
      </Modal>

      {/* Bottom Navigation */}
      <TabBar
        activeTab="home"
        onHomePress={() => {}}
        onQuestPress={navigateToQuests}
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
    backgroundColor: '#f3f7ff',
  },
  topArea: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  logoutButton: {
    position: 'absolute',
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
  },
  locationCoords: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    color: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  filterButton: {
    backgroundColor: '#f97316',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    fontSize: 18,
  },
  chipsRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  settingsButton: {
    backgroundColor: '#f97316',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 18,
  },
  chipsRow: {
    flex: 1,
  },
  chip: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  chipActive: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  chipText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  pointsCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  pointsCompactLabel: {
    color: '#f97316',
    fontSize: 12,
  },
  pointsCompactValue: {
    color: '#f97316',
    fontSize: 18,
    fontWeight: '700',
  },
  mapArea: {
    flex: 1,
    backgroundColor: '#f3f7ff',
    padding: 16,
  },
  map: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalCategory: {
    color: '#f97316',
    fontWeight: '700',
  },
  modalClose: {
    color: '#e2e8f0',
    fontSize: 18,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  modalMeta: {
    color: '#cbd5e1',
    marginTop: 2,
  },
  modalBadges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  badge: {
    backgroundColor: '#334155',
    color: '#e2e8f0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  badgeBlue: {
    backgroundColor: '#f97316',
    color: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalOverview: {
    color: '#e2e8f0',
    marginTop: 10,
    lineHeight: 20,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  navigationButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  navigationButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  detailButton: {
    flex: 1,
    backgroundColor: '#f97316',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  detailButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  startButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 14,
  },
  startButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  // Filter Modal styles
  filterOverlay: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  filterHeader: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f97316',
  },
  filterClose: {
    fontSize: 28,
    color: '#f97316',
    fontWeight: '600',
  },
  tipBox: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  tipTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#10b981',
    textAlign: 'center',
    marginBottom: 8,
  },
  tipSubtitle: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
  },
  characterBox: {
    marginVertical: 20,
    alignItems: 'center',
  },
  characterImage: {
    width: 160,
    height: 160,
  },
  categoryScrollView: {
    width: '100%',
    flex: 1,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  categoryChip: {
    backgroundColor: '#f97316',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    margin: 5,
    shadowColor: '#f97316',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  categoryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default HomeScreen;
