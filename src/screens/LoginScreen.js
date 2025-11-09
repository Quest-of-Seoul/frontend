/**
 * Login Screen
 * User authentication (Sign In / Sign Up)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { signIn, signUp } from '../utils/supabase';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signIn(email, password);

      if (error) {
        Alert.alert('로그인 실패', error.message);
      } else {
        console.log('로그인 성공:', data);
        // 세션이 저장되면 자동으로 Home으로 이동
        navigation.replace('Home');
      }
    } catch (err) {
      Alert.alert('오류', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !nickname) {
      Alert.alert('입력 오류', '모든 필드를 입력해주세요.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('비밀번호 오류', '비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signUp(email, password, nickname);

      if (error) {
        Alert.alert('회원가입 실패', error.message);
      } else {
        Alert.alert(
          '회원가입 성공',
          '이메일 확인을 완료한 후 로그인해주세요.',
          [
            {
              text: '확인',
              onPress: () => setIsSignUp(false),
            },
          ]
        );
      }
    } catch (err) {
      Alert.alert('오류', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    // 게스트로 임시 진입 (개발/테스트용)
    Alert.alert(
      '게스트 모드',
      '게스트로 앱을 둘러보시겠습니까?\n(일부 기능이 제한됩니다)',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '게스트로 계속',
          onPress: () => navigation.replace('Home'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🗺️</Text>
            <Text style={styles.title}>Quest of Seoul</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? '회원가입' : 'AI와 함께하는 서울 탐험'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {isSignUp && (
              <TextInput
                style={styles.input}
                placeholder="닉네임"
                value={nickname}
                onChangeText={setNickname}
                autoCapitalize="none"
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="이메일"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <TextInput
              style={styles.input}
              placeholder="비밀번호 (최소 6자)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={isSignUp ? handleSignUp : handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUp ? '회원가입' : '로그인'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle Sign In / Sign Up */}
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.toggleText}>
                {isSignUp
                  ? '이미 계정이 있으신가요? 로그인'
                  : '계정이 없으신가요? 회원가입'}
              </Text>
            </TouchableOpacity>

            {/* Guest Login */}
            <TouchableOpacity
              style={[styles.button, styles.guestButton]}
              onPress={handleGuestLogin}
            >
              <Text style={styles.guestButtonText}>게스트로 둘러보기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  toggleText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
  guestButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  guestButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;
