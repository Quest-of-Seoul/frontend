/**
 * Quest Map Component
 * Displays quests on a map with markers
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getAllQuests, getNearbyQuests } from '../api/fastapi';

const QuestMap = ({ userLocation, onQuestSelected }) => {
  const [quests, setQuests] = useState([]);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [region, setRegion] = useState({
    latitude: userLocation?.latitude || 37.5665,
    longitude: userLocation?.longitude || 126.9780,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

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

  const handleMarkerPress = (quest) => {
    setSelectedQuest(quest);
  };

  const handleQuestSelect = () => {
    if (selectedQuest && onQuestSelected) {
      onQuestSelected(selectedQuest);
    }
  };

  // Show error message if loading failed
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Failed to load quests</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadQuests}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show loading message
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading quests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="내 위치"
            pinColor="blue"
          />
        )}

        {/* Quest Markers */}
        {quests.map((quest) => (
          <Marker
            key={quest.id}
            coordinate={{
              latitude: quest.lat,
              longitude: quest.lon,
            }}
            title={quest.name}
            description={quest.description}
            onPress={() => handleMarkerPress(quest)}
          >
            <View style={styles.markerContainer}>
              <Text style={styles.markerEmoji}>📍</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Quest Detail Card */}
      {selectedQuest && (
        <View style={styles.questCard}>
          <Text style={styles.questTitle}>{selectedQuest.name}</Text>
          <Text style={styles.questDescription}>{selectedQuest.description}</Text>
          <View style={styles.questInfo}>
            <Text style={styles.rewardText}>
              🎁 보상: {selectedQuest.reward_point} 포인트
            </Text>
          </View>
          <TouchableOpacity style={styles.selectButton} onPress={handleQuestSelect}>
            <Text style={styles.selectButtonText}>퀘스트 시작</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedQuest(null)}
          >
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
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
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerEmoji: {
    fontSize: 32,
  },
  questCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  questTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  questDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  questInfo: {
    marginBottom: 16,
  },
  rewardText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  selectButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default QuestMap;
