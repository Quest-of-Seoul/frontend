/**
 * Home Screen
 * Main landing screen with navigation to features
 */

import React, { useEffect, useState, useCallback } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { getCurrentUser, signOut } from '../utils/supabase';
import { getUserPoints } from '../api/fastapi';
import TabBar from '../components/TabBar';

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);

  // UI state for new home layout
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [placeModalVisible, setPlaceModalVisible] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Load user data once on mount
  useEffect(() => {
    loadUserData();
  }, []);

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

  const navigateToQuests = () => {
    navigation.navigate('Quest');
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

  // Mock place tap handler for the map area (replace with real marker press)
  const handleMapTap = () => {
    setSelectedPlace({
      name: 'Gyeongbokgung Palace',
      category: 'Heritage',
      distanceKm: 3.5,
      rewardPoint: 300,
      address: '161 Sajik-ro, Jongno-gu, Seoul',
      overview:
        'Gyeongbokgung Palace was built in 1395 as the main royal palace of the Joseon dynasty.',
    });
    setPlaceModalVisible(true);
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

      {/* Middle: Map area (placeholder touch to open modal) */}
      <View style={styles.mapArea}>
        <TouchableOpacity style={styles.mapPlaceholder} activeOpacity={0.9} onPress={handleMapTap}>
          <Text style={styles.mapHint}>Tap the map to preview a place</Text>
        </TouchableOpacity>
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
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => {
                setPlaceModalVisible(false);
                navigateToQuests();
              }}
            >
              <Text style={styles.startButtonText}>퀘스트 상세 보기</Text>
            </TouchableOpacity>
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
  },
  mapPlaceholder: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapHint: {
    color: '#64748b',
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
