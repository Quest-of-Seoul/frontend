import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import * as Colors from '../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/spacing';

const ARSceneComponent = ({ onCameraReady, docentMessage, characterImage, onExploreComplete }) => {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (docentMessage) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [docentMessage]);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  useEffect(() => {
    if (device && onCameraReady) {
      onCameraReady();
    }
  }, [device]);

  if (!device) {
    return <View style={styles.container} />;
  }

  if (!hasPermission) {
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
      <Camera
        style={styles.camera}
        device={device}
        isActive={true}
      >
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.characterContainer,
              { opacity: fadeAnim },
            ]}
          >
            <Image
              source={require('../../assets/ai_docent.png')}
              style={styles.characterImage}
              resizeMode="contain"
            />

            {docentMessage && (
              <View style={styles.messageContainer}>
                <Text style={styles.messageText}>
                  {docentMessage}
                </Text>
              </View>
            )}
          </Animated.View>

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
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.GRAY_900,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.xl,
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
    backgroundColor: Colors.GRAY_900 + 'CC',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
    maxWidth: '90%',
  },
  messageText: {
    color: Colors.TEXT_WHITE,
    fontSize: FONT_SIZE.lg,
    textAlign: 'center',
    lineHeight: 24,
  },
  instructionContainer: {
    backgroundColor: Colors.SECONDARY + 'E6',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.xl,
  },
  instructionText: {
    color: Colors.TEXT_WHITE,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  permissionText: {
    color: Colors.TEXT_WHITE,
    fontSize: FONT_SIZE.lg,
    textAlign: 'center',
  },
});

export default ARSceneComponent;
