import React, { useState, useEffect, useCallback } from 'react';
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
import * as Colors from '../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/spacing';
import { shadows, textStyles } from '../utils/theme';
import { createNavigationHandlers } from '../utils/navigation-helpers';

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

      const pointsData = await getUserPoints(user.id);
      setUserPoints(pointsData.total_points);

      const rewards = await getAvailableRewards();
      setAvailableRewards(rewards);

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

  const navHandlers = createNavigationHandlers(navigation);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.SECONDARY} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>보상 스토어</Text>
        <View style={styles.pointsCard}>
          <Text style={styles.pointsLabel}>보유 포인트</Text>
          <Text style={styles.pointsValue}>{userPoints} P</Text>
        </View>
      </View>

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
        onHomePress={navHandlers.navigateToHome}
        onQuestPress={navHandlers.navigateToQuest}
        onARPress={navHandlers.navigateToAR}
        onRewardPress={() => {}}
        onMyPress={navHandlers.navigateToMy}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_LIGHT,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.BACKGROUND_LIGHT,
  },
  header: {
    padding: SPACING.xl,
    backgroundColor: Colors.BACKGROUND_WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_LIGHT,
  },
  title: {
    ...textStyles.h2,
    marginBottom: SPACING.lg,
  },
  pointsCard: {
    backgroundColor: Colors.SECONDARY + '15',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.small,
  },
  pointsLabel: {
    fontSize: FONT_SIZE.lg,
    color: Colors.SECONDARY,
    fontWeight: FONT_WEIGHT.medium,
  },
  pointsValue: {
    fontSize: FONT_SIZE.title,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.SECONDARY,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.BACKGROUND_WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_LIGHT,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.SECONDARY,
  },
  tabText: {
    fontSize: FONT_SIZE.lg,
    color: Colors.TEXT_MUTED,
    fontWeight: FONT_WEIGHT.medium,
  },
  activeTabText: {
    color: Colors.SECONDARY,
    fontWeight: FONT_WEIGHT.bold,
  },
  scrollView: {
    flex: 1,
    padding: SPACING.lg,
  },
  rewardCard: {
    backgroundColor: Colors.BACKGROUND_WHITE,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...shadows.medium,
  },
  rewardHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  rewardType: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  rewardDescription: {
    ...textStyles.body,
    lineHeight: 20,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardCost: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.ACCENT,
  },
  claimButton: {
    backgroundColor: Colors.SECONDARY,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  claimButtonDisabled: {
    backgroundColor: Colors.GRAY_300,
  },
  claimButtonText: {
    color: Colors.TEXT_WHITE,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  claimedBadge: {
    backgroundColor: Colors.SUCCESS_BG,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  claimedText: {
    color: Colors.SUCCESS,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl * 2,
  },
  emptyText: {
    ...textStyles.body,
  },
});

export default RewardScreen;
