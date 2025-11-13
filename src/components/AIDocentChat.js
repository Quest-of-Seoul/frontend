import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import * as Colors from '../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/spacing';

const AIDocentChat = ({
  messages = [],
  onSendMessage,
  quickActions = [],
  placeName,
  style,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim() && onSendMessage) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const renderMessage = (message, index) => {
    const isAI = message.sender === 'ai';
    
    return (
      <View
        key={index}
        style={[
          styles.messageContainer,
          isAI ? styles.aiMessageContainer : styles.userMessageContainer,
        ]}
      >
        {isAI && (
          <View style={styles.aiAvatar}>
            <Text style={styles.avatarEmoji}>🐯</Text>
          </View>
        )}
        
        <View
          style={[
            styles.messageBubble,
            isAI ? styles.aiMessageBubble : styles.userMessageBubble,
          ]}
        >
          {isAI && (
            <Text style={styles.aiLabel}>AI Docent</Text>
          )}
          
          <Text
            style={[
              styles.messageText,
              isAI ? styles.aiMessageText : styles.userMessageText,
            ]}
          >
            {message.text}
          </Text>

          {message.image && (
            <Image
              source={typeof message.image === 'string' ? { uri: message.image } : message.image}
              style={styles.messageImage}
              resizeMode="cover"
            />
          )}

          {message.button && (
            <TouchableOpacity
              style={styles.messageButton}
              onPress={message.button.onPress}
            >
              <Text style={styles.messageButtonText}>{message.button.text}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {placeName && (
        <View style={styles.placeHeader}>
          <Text style={styles.placeHeaderText}>{placeName}</Text>
        </View>
      )}

      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
      </ScrollView>

      {quickActions.length > 0 && (
        <View style={styles.quickActionsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsContent}
          >
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionButton}
                onPress={action.onPress}
              >
                <Text style={styles.quickActionText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="message"
            placeholderTextColor={Colors.TEXT_LIGHT}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity style={styles.micButton}>
            <Text style={styles.micIcon}>🎤</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_WHITE,
  },
  placeHeader: {
    backgroundColor: Colors.BACKGROUND_DARK,
    padding: SPACING.md,
    alignItems: 'center',
  },
  placeHeaderText: {
    color: Colors.TEXT_WHITE,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  aiMessageBubble: {
    backgroundColor: Colors.BACKGROUND_DARK,
    borderBottomLeftRadius: 4,
  },
  userMessageBubble: {
    backgroundColor: Colors.SECONDARY,
    borderBottomRightRadius: 4,
  },
  aiLabel: {
    fontSize: FONT_SIZE.xs,
    color: Colors.TEXT_LIGHT,
    marginBottom: 4,
  },
  messageText: {
    fontSize: FONT_SIZE.md,
    lineHeight: 20,
  },
  aiMessageText: {
    color: Colors.TEXT_ON_DARK,
  },
  userMessageText: {
    color: Colors.TEXT_WHITE,
  },
  messageImage: {
    width: '100%',
    height: 150,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  messageButton: {
    backgroundColor: Colors.PRIMARY,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  messageButtonText: {
    color: Colors.TEXT_WHITE,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
  quickActionsContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER_LIGHT,
    paddingVertical: SPACING.sm,
  },
  quickActionsContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  quickActionButton: {
    backgroundColor: Colors.SECONDARY,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.round,
  },
  quickActionText: {
    color: Colors.TEXT_WHITE,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER_LIGHT,
    gap: SPACING.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.GRAY_100,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: Colors.TEXT_PRIMARY,
    paddingVertical: SPACING.sm,
    maxHeight: 100,
  },
  micButton: {
    padding: 4,
  },
  micIcon: {
    fontSize: 20,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 18,
    color: Colors.TEXT_WHITE,
  },
});

export default AIDocentChat;

