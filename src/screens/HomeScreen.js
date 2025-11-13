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
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';
import { getCurrentUser, signOut } from '../utils/supabase';
import { getUserPoints, getNearbyQuests, getAllQuests } from '../api/fastapi';
import { calculateDistance, getWalkingRoute } from '../utils/navigation';
import TabBar from '../components/TabBar';
import SimpleKakaoMap from '../components/SimpleKakaoMap';
import CategoryChip from '../components/CategoryChip';
import * as Colors from '../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/spacing';

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [placeModalVisible, setPlaceModalVisible] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.5665, // Seoul City Hall
    longitude: 126.9780,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [quests, setQuests] = useState([]);
  const webViewRef = useRef(null);

  const [showDistanceOverlay, setShowDistanceOverlay] = useState(false);

  useEffect(() => {
    loadUserData();
    requestLocationPermission();
    fetchNearbyQuests(37.5665, 126.9780);
  }, []);

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
          return;
        }
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          setCurrentLocation({ latitude, longitude });
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });

          fetchNearbyQuests(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );

      const watchId = Geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          setCurrentLocation({ latitude, longitude });
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });

          fetchNearbyQuests(latitude, longitude);
        },
        (error) => {
          console.error('Error watching location:', error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 5, // 5미터 이동 시 업데이트
          interval: 2000, // Android: 2초마다 업데이트
        }
      );

      return () => {
        Geolocation.clearWatch(watchId);
      };
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      refreshPoints();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();

      setUser(currentUser);

      if (currentUser && currentUser.id) {
        try {
          const pointsData = await getUserPoints(currentUser.id);
          setPoints(pointsData.total_points);
        } catch (error) {
          console.error('Error fetching points:', error.response?.data || error.message);
          setPoints(0);
        }
      } else {
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
        setPoints(pointsData.total_points);
      }
    } catch (error) {
      console.error('Error refreshing points:', error);
    }
  };

  const fetchNearbyQuests = async (latitude, longitude) => {
    try {
      const [nearbyData, allQuestsData] = await Promise.all([
        getNearbyQuests(latitude, longitude, 50.0),
        getAllQuests(),
      ]);

      const nearbyQuests = nearbyData.quests || [];
      const allQuestsList = allQuestsData || [];

      const combinedQuests = [...allQuestsList, ...nearbyQuests];

      const uniqueQuests = Array.from(
        new Map(combinedQuests.map(q => [q.quest_id || q.id, q])).values()
      );

      setQuests(uniqueQuests);
    } catch (error) {
      console.error('Error fetching nearby quests:', error);
      Alert.alert('오류', '퀘스트를 불러올 수 없습니다.');
      setQuests([]);
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
    Alert.alert('알림', '마이 페이지를 준비하고 있습니다.');
  };

  const handleQuestMarkerPress = (quest) => {
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

      // 거리에 따른 처리
      if (distance > 10.0) {
        // 10km 이상이면 오버레이 표시
        setShowDistanceOverlay(true);
        setPlaceModalVisible(false);
      } else {
        // 10km 이내이면 바로 경로 가져오기
        try {
          // Kakao Mobility API로 경로 가져오기
          const routeData = await getWalkingRoute(
            currentLocation.latitude,
            currentLocation.longitude,
            selectedPlace.latitude,
            selectedPlace.longitude
          );

          // 지도에 경로 그리기
          if (webViewRef.current && webViewRef.current.drawRoute) {
            webViewRef.current.drawRoute(routeData.coordinates);
            setPlaceModalVisible(false);

            Alert.alert(
              '걷기 퀘스트 시작! 🚶',
              `거리: ${routeData.distance}m · 예상 시간: ${Math.ceil(routeData.duration / 60)}분`,
              [{ text: '확인' }]
            );
          } else {
            console.error('Map ref not available');
            Alert.alert('오류', '지도를 사용할 수 없습니다.');
          }
        } catch (routeError) {
          console.error('Route error:', routeError);
          Alert.alert('경로 조회 실패', routeError.message || '경로를 가져올 수 없습니다.');
        }
      }
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('오류', '거리 계산에 실패했습니다.');
    }
  };

  const openKakaoMapNavigation = async () => {
    if (!currentLocation || !selectedPlace) return;

    const { latitude: startLat, longitude: startLon } = currentLocation;
    const { latitude: destLat, longitude: destLon, name: destName } = selectedPlace;

    const kakaoMapUrl = `kakaomap://route?sp=${startLat},${startLon}&ep=${destLat},${destLon}&by=FOOT`;

    const webUrl = `https://map.kakao.com/link/to/${encodeURIComponent(destName || '목적지')},${destLat},${destLon}`;

    try {
      const canOpen = await Linking.canOpenURL(kakaoMapUrl);
      if (canOpen) {
        await Linking.openURL(kakaoMapUrl);
      } else {
        await Linking.openURL(webUrl);
      }
      setShowDistanceOverlay(false);
    } catch (error) {
      console.error('Error opening Kakao Map:', error);
      Alert.alert('오류', '카카오맵을 열 수 없습니다.');
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
            onPress={() => setFilterModalVisible(true)}
          >
            <Text style={styles.filterIcon}>🔍</Text>
          </TouchableOpacity>
        </View>

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

        {user && (
          <View style={styles.pointsCompact}>
            <Text style={styles.pointsCompactLabel}>보유 포인트</Text>
            <Text style={styles.pointsCompactValue}>{points} P</Text>
          </View>
        )}
      </View>

      <View style={styles.mapArea}>
        <SimpleKakaoMap
          ref={webViewRef}
          latitude={currentLocation?.latitude || region.latitude}
          longitude={currentLocation?.longitude || region.longitude}
          quests={quests}
          onMarkerPress={handleQuestMarkerPress}
          style={styles.map}
        />

        {showDistanceOverlay && (
          <View style={styles.distanceOverlay}>
            <View style={styles.overlayContent}>
              <View style={styles.overlayIcon}>
                <Text style={styles.overlayEmoji}>🦝</Text>
                <View style={styles.overlayWarning}>
                  <Text style={styles.overlayWarningIcon}>⚠️</Text>
                </View>
              </View>
              <Text style={styles.overlayTitle}>Oh no! I can't find you</Text>
              <Text style={styles.overlayMessage}>
                Please move near to the{'\n'}place you've chosen.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.overlayNavButton}
              onPress={openKakaoMapNavigation}
            >
              <Text style={styles.overlayNavIcon}>🧭</Text>
              <Text style={styles.overlayNavText}>Do you need navigation?</Text>
              <Text style={styles.overlayNavArrow}>▶</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.overlayCloseButton}
              onPress={() => setShowDistanceOverlay(false)}
            >
              <Text style={styles.overlayCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal visible={placeModalVisible} transparent animationType="slide" onRequestClose={() => setPlaceModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{selectedPlace?.category}</Text>
              </View>
              <TouchableOpacity onPress={() => setPlaceModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>{selectedPlace?.name}</Text>
            <Text style={styles.modalSubtitle}>{selectedPlace?.address}</Text>

            <View style={styles.modalInfoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>거리</Text>
                <Text style={styles.infoValue}>{selectedPlace?.distanceKm || 0} km</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>포인트</Text>
                <Text style={styles.infoValue}>{selectedPlace?.rewardPoint || 0} P</Text>
              </View>
            </View>

            <View style={styles.navigationRow}>
              <Text style={styles.navigationIcon}>🧭</Text>
              <Text style={styles.navigationText}>Do you need navigation?</Text>
              <TouchableOpacity onPress={handleStartNavigation}>
                <Text style={styles.navigationArrow}>▶</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => {
                setPlaceModalVisible(false);
                navigateToQuests(selectedPlace);
              }}
            >
              <Text style={styles.startButtonText}>START</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={filterModalVisible} transparent animationType="fade" onRequestClose={() => setFilterModalVisible(false)}>
        <View style={styles.filterOverlay}>
          <LinearGradient
            colors={[Colors.BACKGROUND_LIGHT, Colors.BACKGROUND_WHITE]}
            style={styles.filterContent}
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

            <View style={styles.characterBox}>
              <Image
                source={require('../../assets/ai_docent.png')}
                style={styles.characterImage}
                resizeMode="contain"
              />
            </View>

            <ScrollView style={styles.categoryScrollView} contentContainerStyle={styles.categoryScrollContent}>
              <View style={styles.categoryContainer}>
                {['Heritage', 'Cuisine', 'Shopping', 'K-culture', 'Healing', 'Art', 'Romantic', 'Walk', 'Faith', 'Nearest Trip', 'Most Rewarded', 'Newest'].map((cat) => (
                  <CategoryChip
                    key={cat}
                    label={cat}
                    selected={selectedCategory === cat}
                    size="large"
                    onPress={() => {
                      setSelectedCategory(cat);
                      setFilterModalVisible(false);
                    }}
                  />
                ))}
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>

      <TabBar
        activeTab="home"
        onHomePress={() => { }}
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
    backgroundColor: Colors.BACKGROUND_LIGHT,
  },
  topArea: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: Colors.BACKGROUND_WHITE,
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
    color: Colors.TEXT_PRIMARY,
  },
  logoutButton: {
    position: 'absolute',
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.GRAY_100,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 14,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_WHITE,
    color: Colors.TEXT_PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER_LIGHT,
  },
  filterButton: {
    backgroundColor: Colors.PRIMARY,
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
    backgroundColor: Colors.PRIMARY,
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
    backgroundColor: Colors.BACKGROUND_WHITE,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.BORDER_LIGHT,
  },
  chipActive: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  chipText: {
    color: Colors.TEXT_MUTED,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.TEXT_WHITE,
  },
  pointsCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: Colors.BACKGROUND_WHITE,
    borderWidth: 1,
    borderColor: Colors.BORDER_LIGHT,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  pointsCompactLabel: {
    color: Colors.PRIMARY,
    fontSize: 12,
  },
  pointsCompactValue: {
    color: Colors.PRIMARY,
    fontSize: 18,
    fontWeight: '700',
  },
  mapArea: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_LIGHT,
    padding: 16,
  },
  map: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: Colors.OVERLAY,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.BACKGROUND_DARK,
    padding: SPACING.xl,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryBadge: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: RADIUS.sm,
  },
  categoryBadgeText: {
    color: Colors.TEXT_WHITE,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  modalClose: {
    color: Colors.TEXT_ON_DARK,
    fontSize: 24,
    fontWeight: '300',
  },
  modalTitle: {
    color: Colors.TEXT_WHITE,
    fontSize: FONT_SIZE.title,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    color: Colors.TEXT_ON_DARK,
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.lg,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.BACKGROUND_DARK_SECONDARY,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    color: Colors.TEXT_LIGHT,
    fontSize: FONT_SIZE.xs,
    marginBottom: 4,
  },
  infoValue: {
    color: Colors.TEXT_WHITE,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.BACKGROUND_DARK_SECONDARY,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  navigationIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  navigationText: {
    flex: 1,
    color: Colors.TEXT_ON_DARK,
    fontSize: FONT_SIZE.md,
  },
  navigationArrow: {
    color: Colors.PRIMARY,
    fontSize: 16,
  },
  startButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    color: Colors.TEXT_WHITE,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
  },
  filterOverlay: {
    flex: 1,
    backgroundColor: Colors.OVERLAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 24,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.PRIMARY,
  },
  filterClose: {
    fontSize: 28,
    color: Colors.PRIMARY,
    fontWeight: '600',
  },
  tipBox: {
    backgroundColor: Colors.BACKGROUND_WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: Colors.SHADOW,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.BORDER_LIGHT,
  },
  tipTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: Colors.ACCENT,
    textAlign: 'center',
    marginBottom: 8,
  },
  tipSubtitle: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
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
    flex: 1,
  },
  categoryScrollContent: {
    paddingBottom: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  distanceOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: Colors.BACKGROUND_WHITE,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.SHADOW_DARK,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  overlayContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  overlayIcon: {
    position: 'relative',
    marginBottom: 12,
  },
  overlayEmoji: {
    fontSize: 60,
  },
  overlayWarning: {
    position: 'absolute',
    bottom: 0,
    right: -8,
    backgroundColor: Colors.ERROR,
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayWarningIcon: {
    fontSize: 18,
  },
  overlayTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.SECONDARY,
    marginBottom: 8,
  },
  overlayMessage: {
    fontSize: 15,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
  },
  overlayNavButton: {
    backgroundColor: Colors.BACKGROUND_WHITE,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.SECONDARY,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  overlayNavIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  overlayNavText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.SECONDARY,
    flex: 1,
  },
  overlayNavArrow: {
    fontSize: 16,
    color: Colors.SECONDARY,
    marginLeft: 8,
  },
  overlayCloseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayCloseText: {
    fontSize: 22,
    color: Colors.TEXT_LIGHT,
    fontWeight: '300',
  },
});

export default HomeScreen;
