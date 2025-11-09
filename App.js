/**
 * Quest of Seoul
 * Main App Entry Point
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { getSession } from './src/utils/supabase';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import QuestScreen from './src/screens/QuestScreen';
import ARScreen from './src/screens/ARScreen';
import RewardScreen from './src/screens/RewardScreen';

const Stack = createStackNavigator();

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await getSession();

      if (session) {
        console.log('✅ 세션 존재, Home으로 이동');
        setInitialRoute('Home');
      } else {
        console.log('❌ 세션 없음, Login으로 이동');
        setInitialRoute('Login');
      }
    } catch (error) {
      console.error('세션 체크 에러:', error);
      setInitialRoute('Login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false, // 로그인 화면은 헤더 숨김
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Quest of Seoul' }}
        />
        <Stack.Screen
          name="Quest"
          component={QuestScreen}
          options={{ title: '퀘스트 맵' }}
        />
        <Stack.Screen
          name="AR"
          component={ARScreen}
          options={{
            title: 'AR 체험',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Reward"
          component={RewardScreen}
          options={{ title: '보상 스토어' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
});

export default App;
