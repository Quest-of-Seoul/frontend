import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { getDocentMessageWS } from '../api/fastapi';
import { playAudioChunkStreaming, clearAudioQueue } from '../utils/audio';
import * as Colors from '../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/spacing';

const DocentDialog = ({ userId, landmark, onMessageReceived, isMuted, setIsMuted }) => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (messageText) => {
    if (!messageText || !messageText.trim()) return;

    const userMessage = messageText.trim();
    setLoading(true);

    const userMessageId = `user-${Date.now()}-${Math.random()}`;
    setMessages((prev) => [...prev, { type: 'user', text: userMessage, id: userMessageId }]);

    try {
      if (!isMuted) {
        clearAudioQueue();
      }

      const response = await getDocentMessageWS(
        userId,
        landmark,
        userMessage,
        'ko',
        (data) => {
          const aiMessageId = `ai-${Date.now()}-${Math.random()}`;
          setMessages((prev) => [
            ...prev,
            { type: 'ai', text: data.message, id: aiMessageId },
          ]);
        },
        (chunk) => {
          if (!isMuted) {
            playAudioChunkStreaming(chunk);
          }
        },
        !isMuted
      );

      if (onMessageReceived) {
        onMessageReceived({ message: response.message });
      }
    } catch (error) {
      console.error(' Error sending message:', error);
      const errorMessageId = `error-${Date.now()}-${Math.random()}`;
      setMessages((prev) => [
        ...prev,
        { type: 'error', text: '메시지를 전송하는 중 오류가 발생했습니다.', id: errorMessageId },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const message = userInput.trim();
    setUserInput(''); // Clear input immediately
    await sendMessage(message);
  };

  const handleQuickQuestion = async (question) => {
    if (loading) return; // Prevent multiple simultaneous requests
    await sendMessage(question);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messageContainer}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.type === 'user' ? styles.userMessage : styles.aiMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                msg.type === 'user' ? styles.userText : styles.aiText,
              ]}
            >
              {msg.text}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#6366f1" />
            <Text style={styles.loadingText}>AI 도슨트가 생각 중...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.quickQuestions}>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => handleQuickQuestion('이곳의 역사에 대해 알려주세요')}
        >
          <Text style={styles.quickButtonText}>역사</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => handleQuickQuestion('재미있는 이야기가 있나요?')}
        >
          <Text style={styles.quickButtonText}>재미있는 이야기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => handleQuickQuestion('방문 팁을 알려주세요')}
        >
          <Text style={styles.quickButtonText}>방문 팁</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="질문을 입력하세요..."
          value={userInput}
          onChangeText={setUserInput}
          onSubmitEditing={handleSendMessage}
          multiline
        />
        <TouchableOpacity
          style={styles.muteButton}
          onPress={() => setIsMuted(!isMuted)}
        >
          <Text style={styles.muteButtonText}>
            {isMuted ? '🔇' : '🔊'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={loading || !userInput.trim()}
        >
          <Text style={styles.sendButtonText}>전송</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messageContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6366f1',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
  },
  aiText: {
    color: '#1f2937',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  quickQuestions: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#e0e7ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    marginRight: 8,
    maxHeight: 100,
  },
  muteButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteButtonText: {
    fontSize: 20,
  },
  sendButton: {
    backgroundColor: '#6366f1',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DocentDialog;
