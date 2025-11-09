/**
 * Reward Screen
 * Shows available rewards and allows redemption
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getCurrentUser } from '../utils/supabase';
import {
  getUserPoints,
  getAvailableRewards,
  claimReward,
  getClaimedRewards,
} from '../api/fastapi';
import TabBar from '../components/TabBar';

const RewardScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'claimed'
  const [userPoints, setUserPoints] = useState(0);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      setUserId(user.id);

      // Load user points
      const pointsData = await getUserPoints(user.id);
      setUserPoints(pointsData.total_points);

      // Load available rewards
      const rewards = await getAvailableRewards();
      setAvailableRewards(rewards);

      // Load claimed rewards
      const claimed = await getClaimedRewards(user.id);
      setClaimedRewards(claimed);
    } catch (error) {
      console.error('Error loading reward data:', error);
      Alert.alert('오류', '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (reward) => {
    if (!userId) return;

    Alert.alert(
      '보상 교환',
      `${reward.name}을(를) ${reward.point_cost} 포인트로 교환하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '교환',
          onPress: async () => {
            try {
              const result = await claimReward(userId, reward.id);

              if (result.status === 'success') {
                Alert.alert('성공', result.message);
                loadData(); // Reload data
              } else {
                Alert.alert('실패', result.message);
              }
            } catch (error) {
              console.error('Error claiming reward:', error);
              Alert.alert('오류', '보상 교환 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const renderRewardCard = (reward, isClaimed = false) => {
    const canAfford = userPoints >= reward.point_cost;

    return (
      <View key={reward.id} style={styles.rewardCard}>
        <View style={styles.rewardHeader}>
          <Text style={styles.rewardType}>
            {reward.type === 'badge' ? '🏆' : '🎫'}
          </Text>
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardName}>{reward.name}</Text>
            <Text style={styles.rewardDescription}>{reward.description}</Text>
          </View>
        </View>

        <View style={styles.rewardFooter}>
          <Text style={styles.rewardCost}>{reward.point_cost} P</Text>
          {!isClaimed && (
            <TouchableOpacity
              style={[
                styles.claimButton,
                !canAfford && styles.claimButtonDisabled,
              ]}
              onPress={() => handleClaimReward(reward)}
              disabled={!canAfford}
            >
              <Text style={styles.claimButtonText}>
                {canAfford ? '교환하기' : '포인트 부족'}
              </Text>
            </TouchableOpacity>
          )}
          {isClaimed && (
            <View style={styles.claimedBadge}>
              <Text style={styles.claimedText}>✓ 획득함</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const navigateToHome = () => {
    navigation.navigate('Home');
  };

  const navigateToQuests = () => {
    navigation.navigate('Quest');
  };

  const navigateToAR = () => {
    navigation.navigate('AR');
  };

  const navigateToMy = () => {
    navigation.navigate('My');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>보상 스토어</Text>
        <View style={styles.pointsCard}>
          <Text style={styles.pointsLabel}>보유 포인트</Text>
          <Text style={styles.pointsValue}>{userPoints} P</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'available' && styles.activeTabText,
            ]}
          >
            사용 가능
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'claimed' && styles.activeTab]}
          onPress={() => setActiveTab('claimed')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'claimed' && styles.activeTabText,
            ]}
          >
            획득한 보상
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rewards List */}
      <ScrollView style={styles.scrollView}>
        {activeTab === 'available' &&
          availableRewards.map((reward) => renderRewardCard(reward, false))}

        {activeTab === 'claimed' && claimedRewards.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>아직 획득한 보상이 없습니다</Text>
          </View>
        )}

        {activeTab === 'claimed' &&
          claimedRewards.map((item) => renderRewardCard(item.rewards, true))}
      </ScrollView>

      <TabBar
        activeTab="reward"
        onHomePress={navigateToHome}
        onQuestPress={navigateToQuests}
        onARPress={navigateToAR}
        onRewardPress={() => {}}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  pointsCard: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 16,
    color: '#0369a1',
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0369a1',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#6366f1',
  },
  tabText: {
    fontSize: 16,
    color: '#6b7280',
  },
  activeTabText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  rewardCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rewardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  rewardType: {
    fontSize: 32,
    marginRight: 12,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardCost: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  claimButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  claimButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  claimButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  claimedBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  claimedText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default RewardScreen;
