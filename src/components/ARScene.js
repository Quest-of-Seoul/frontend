/**
 * AR Scene Component - Expo Camera Version
 * Displays camera view with AR overlay
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const ARSceneComponent = ({ onCameraReady, docentMessage, characterImage, onExploreComplete }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (docentMessage) {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [docentMessage]);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          카메라 권한이 필요합니다
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        style={styles.camera}
        facing="back"
        onCameraReady={onCameraReady}
      >
        {/* AR Overlay */}
        <View style={styles.overlay}>
          {/* AI Docent Character */}
          <Animated.View
            style={[
              styles.characterContainer,
              { opacity: fadeAnim },
            ]}
          >
            {/* AI Docent Character */}
            <Image
              source={require('../../assets/ai_docent.png')}
              style={styles.characterImage}
              resizeMode="contain"
            />

            {/* Docent Message */}
            {docentMessage && (
              <View style={styles.messageContainer}>
                <Text style={styles.messageText}>
                  {docentMessage}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* AR Instruction / Complete Button */}
          <TouchableOpacity
            style={styles.instructionContainer}
            onPress={onExploreComplete}
            activeOpacity={0.8}
          >
            <Text style={styles.instructionText}>
              🎉 퀘스트 완료!
            </Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  characterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  characterImage: {
    width: 200,
    height: 200,
  },
  messageContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    maxWidth: '90%',
  },
  messageText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  instructionContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 20,
  },
  instructionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  permissionText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ARSceneComponent;
