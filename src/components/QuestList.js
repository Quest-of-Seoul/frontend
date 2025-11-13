
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { getAllQuests } from '../api/fastapi';
import * as Colors from '../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/spacing';
import { shadows } from '../utils/theme';

const QuestList = ({ onQuestSelected }) => {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    try {
      setLoading(true);
      setError(null);
      const questData = await getAllQuests();
      setQuests(questData || []);
    } catch (error) {
      console.error('Error loading quests:', error);
      setError(error.message || 'Failed to load quests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.SECONDARY} />
        <Text style={styles.loadingText}>Loading quests...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load quests</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadQuests}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Quests</Text>
        <Text style={styles.headerSubtitle}>{quests.length} quests found</Text>
      </View>

      {quests.map((quest) => (
        <TouchableOpacity
          key={quest.id}
          style={styles.questCard}
          onPress={() => onQuestSelected && onQuestSelected(quest)}
        >
          <View style={styles.questHeader}>
            <Text style={styles.questEmoji}>📍</Text>
            <View style={styles.questInfo}>
              <Text style={styles.questName}>{quest.name}</Text>
              <Text style={styles.questDescription}>{quest.description}</Text>
            </View>
          </View>

          <View style={styles.questFooter}>
            <Text style={styles.rewardText}>🎁 {quest.reward_point} points</Text>
            <View style={styles.locationBadge}>
              <Text style={styles.locationText}>
                📌 {quest.lat.toFixed(4)}, {quest.lon.toFixed(4)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_LIGHT,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  header: {
    backgroundColor: Colors.SECONDARY,
    padding: SPACING.xl,
    paddingTop: SPACING.xxxl + 8,
  },
  headerTitle: {
    fontSize: FONT_SIZE.title,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.TEXT_WHITE,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.md,
    color: Colors.TEXT_WHITE + 'CC',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.lg,
    color: Colors.TEXT_MUTED,
  },
  errorText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.ERROR,
    marginBottom: SPACING.sm,
  },
  errorDetail: {
    fontSize: FONT_SIZE.md,
    color: Colors.TEXT_MUTED,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: Colors.SECONDARY,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  retryButtonText: {
    color: Colors.TEXT_WHITE,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
  },
  questCard: {
    backgroundColor: Colors.BACKGROUND_WHITE,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...shadows.medium,
  },
  questHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  questEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  questInfo: {
    flex: 1,
  },
  questName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  questDescription: {
    fontSize: FONT_SIZE.md,
    color: Colors.TEXT_MUTED,
    lineHeight: 20,
  },
  questFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER_LIGHT,
    paddingTop: SPACING.md,
  },
  rewardText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: Colors.ACCENT,
    marginBottom: SPACING.sm,
  },
  locationBadge: {
    backgroundColor: Colors.GRAY_100,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: FONT_SIZE.sm,
    color: Colors.TEXT_MUTED,
  },
});

export default QuestList;
