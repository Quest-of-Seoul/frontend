import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Colors from '../constants/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../constants/spacing';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Fade in and scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to Login after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#FF9A56', '#A8D5FF', '#B8E6C8']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Logo/Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Quest of Seoul</Text>
          </View>

          {/* Landmarks Illustration - Seoul outline */}
          <View style={styles.landmarksContainer}>
            <Text style={styles.landmarkText}>🏯 🗼 🏰</Text>
          </View>

          {/* Mascot/Tiger Character */}
          <View style={styles.mascotContainer}>
            <Image
              source={require('../../assets/ai_docent.png')}
              style={styles.mascot}
              resizeMode="contain"
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.TEXT_WHITE,
    textAlign: 'center',
    textShadowColor: Colors.PRIMARY,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
  },
  landmarksContainer: {
    alignItems: 'center',
    marginBottom: 40,
    opacity: 0.2,
  },
  landmarkText: {
    fontSize: 60,
    color: Colors.TEXT_WHITE,
  },
  mascotContainer: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascot: {
    width: '100%',
    height: '100%',
  },
});

export default SplashScreen;

