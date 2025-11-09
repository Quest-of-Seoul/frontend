/**
 * Quest List Component (No Map - for web/PC testing)
 * Simple list view of quests
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { getAllQuests } from '../api/fastapi';

const QuestList = ({ onQuestSelected }) => {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    try {
      console.log('Loading quests...');
      setLoading(true);
      setError(null);
      const questData = await getAllQuests();
      console.log('Quests loaded:', questData);
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
        <ActivityIndicator size="large" color="#6366f1" />
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
    backgroundColor: '#f3f4f6',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#6366f1',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  questCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  questEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  questInfo: {
    flex: 1,
  },
  questName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  questDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  questFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 8,
  },
  locationBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default QuestList;
