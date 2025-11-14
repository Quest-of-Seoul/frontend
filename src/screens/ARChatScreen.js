import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import * as Colors from '../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/spacing';
import AIDocentChat from '../components/AIDocentChat';
import Button from '../components/Button';
import TabBar from '../components/TabBar';
import { getCurrentUser } from '../utils/supabase';
import { getDocentMessageWS } from '../api/fastapi';

const ARChatScreen = ({ navigation, route }) => {
  const { place } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedTab, setSelectedTab] = useState('chat');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
    loadInitialMessage();
  }, []);

  const loadUser = async () => {
    try {
      const user = await getCurrentUser();
      setUserId(user?.id);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadInitialMessage = async () => {
    const initialMessages = [
      {
        sender: 'ai',
        text: `안녕? 나는 AI도슨트야! ${place?.title || '명소'}에 온 걸 환영해!`,
      },
      {
        sender: 'ai',
        text: '재미있는 사실, 역사, 꿀팁 뭐든 물어봐!',
      },
    ];
    setMessages(initialMessages);
  };

  const handleSendMessage = async (text) => {
    if (!userId) {
      Alert.alert('오류', '사용자 정보를 불러올 수 없습니다.');
      return;
    }

    const userMessage = { sender: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await getDocentMessageWS(
        userId,
        place?.title || place?.name || '서울',
        text,
        'ko',
        (data) => {
          const aiMessage = { sender: 'ai', text: data.message };
          setMessages(prev => [...prev, aiMessage]);
        },
        null,
        false
      );
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('오류', '메시지 전송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Fun Facts', onPress: () => handleQuickAction('fun-facts') },
    { label: 'History', onPress: () => handleQuickAction('history') },
    { label: 'Tips!', onPress: () => handleQuickAction('tips') },
    { label: 'Quest', onPress: () => navigation.navigate('Quiz', { quest: place }) },
  ];

  const handleQuickAction = async (action) => {
    if (!userId) {
      Alert.alert('오류', '사용자 정보를 불러올 수 없습니다.');
      return;
    }

    let userMessage = '';

    switch (action) {
      case 'fun-facts':
        userMessage = 'Tell me fun facts about this place';
        break;
      case 'history':
        userMessage = 'Tell me the history of this place';
        break;
      case 'tips':
        userMessage = 'Give me tips for visiting this place';
        break;
      default:
        return;
    }

    await handleSendMessage(userMessage);
  };

  const renderChatMode = () => (
    <AIDocentChat
      messages={messages}
      onSendMessage={handleSendMessage}
      quickActions={quickActions}
      placeName={place?.title}
    />
  );

  const renderInfoMode = () => (
    <ScrollView style={styles.infoContainer}>
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Place Information</Text>
        <Text style={styles.infoText}>
          {place?.description || place?.overview || '장소 정보를 불러오는 중입니다...'}
        </Text>
      </View>

      {place?.address && (
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Address</Text>
          <Text style={styles.infoText}>{place.address}</Text>
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>AI Docent Recommendations</Text>
        <View style={styles.aiRecommendCard}>
          <Text style={styles.aiRecommendIcon}>🔍</Text>
          <Text style={styles.aiRecommendText}>
            Show me your image! I will find out your best tour route
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderRecommendationMode = () => (
    <ScrollView style={styles.recommendContainer}>
      <Text style={styles.recommendTitle}>
        Here's the top 3 places that look similar to your image
      </Text>

      {/* Place cards would go here */}
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderText}>Similar places will appear here</Text>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{place?.title || 'AI Docent'}</Text>
        <TouchableOpacity>
          <Text style={styles.infoButton}>ℹ️</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.cameraButton}>📷</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'info' && styles.tabActive]}
          onPress={() => setSelectedTab('info')}
        >
          <Text style={[styles.tabText, selectedTab === 'info' && styles.tabTextActive]}>
            Information
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'chat' && styles.tabActive]}
          onPress={() => setSelectedTab('chat')}
        >
          <Text style={[styles.tabText, selectedTab === 'chat' && styles.tabTextActive]}>
            Chat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'recommendation' && styles.tabActive]}
          onPress={() => setSelectedTab('recommendation')}
        >
          <Text style={[styles.tabText, selectedTab === 'recommendation' && styles.tabTextActive]}>
            Recommendation
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {selectedTab === 'chat' && renderChatMode()}
        {selectedTab === 'info' && renderInfoMode()}
        {selectedTab === 'recommendation' && renderRecommendationMode()}
      </View>

      <TabBar
        activeTab="ar"
        onHomePress={() => navigation.navigate('Home')}
        onQuestPress={() => navigation.navigate('Quest')}
        onARPress={() => { }}
        onRewardPress={() => navigation.navigate('Reward')}
        onMyPress={() => navigation.navigate('My')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_LIGHT,
    gap: SPACING.md,
  },
  backButton: {
    fontSize: 24,
    color: Colors.TEXT_PRIMARY,
  },
  headerTitle: {
    flex: 1,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.TEXT_PRIMARY,
  },
  infoButton: {
    fontSize: 20,
  },
  cameraButton: {
    fontSize: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_LIGHT,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.SECONDARY,
  },
  tabText: {
    fontSize: FONT_SIZE.sm,
    color: Colors.TEXT_MUTED,
    fontWeight: FONT_WEIGHT.medium,
  },
  tabTextActive: {
    color: Colors.SECONDARY,
    fontWeight: FONT_WEIGHT.bold,
  },
  content: {
    flex: 1,
  },

  // Info Mode
  infoContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  infoSection: {
    marginBottom: SPACING.xl,
  },
  infoTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.TEXT_PRIMARY,
    marginBottom: SPACING.md,
  },
  infoText: {
    fontSize: FONT_SIZE.md,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 22,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_LIGHT,
  },
  scheduleLabel: {
    fontSize: FONT_SIZE.md,
    color: Colors.TEXT_SECONDARY,
  },
  scheduleTime: {
    fontSize: FONT_SIZE.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: FONT_WEIGHT.medium,
  },
  aiRecommendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.SECONDARY + '15',
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    gap: SPACING.md,
  },
  aiRecommendIcon: {
    fontSize: 32,
  },
  aiRecommendText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
  },

  // Recommendation Mode
  recommendContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  recommendTitle: {
    fontSize: FONT_SIZE.md,
    color: Colors.TEXT_SECONDARY,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  placeholderCard: {
    backgroundColor: Colors.GRAY_100,
    padding: SPACING.xxxl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: FONT_SIZE.md,
    color: Colors.TEXT_MUTED,
  },
});

export default ARChatScreen;

