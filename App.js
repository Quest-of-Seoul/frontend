/**
 * Quest of Seoul
 * Main App Entry Point
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import useAuthStore from './src/stores/authStore';
import { PRIMARY, BACKGROUND_LIGHT, WHITE } from './src/constants';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import QuestScreen from './src/screens/QuestScreen';
import ARScreen from './src/screens/ARScreen';
import RewardScreen from './src/screens/RewardScreen';

const Stack = createStackNavigator();

function App() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'Home' : 'Login'}
        screenOptions={{
          headerStyle: {
            backgroundColor: PRIMARY,
          },
          headerTintColor: WHITE,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
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
    backgroundColor: BACKGROUND_LIGHT,
  },
});

export default App;
