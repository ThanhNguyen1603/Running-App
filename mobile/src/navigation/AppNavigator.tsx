import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/authStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import ConnectStravaScreen from '../screens/onboarding/ConnectStravaScreen';
import * as Linking from 'expo-linking';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { accessToken, stravaConnected, setStravaConnected } = useAuthStore();

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (url.includes('runningapp://strava')) {
        const parsed = Linking.parse(url);
        if (parsed.queryParams?.success === 'true') {
          setStravaConnected(true);
        }
      }
    });
    return () => subscription.remove();
  }, [setStravaConnected]);

  if (!accessToken) {
    return <AuthNavigator />;
  }

  if (!stravaConnected) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ConnectStrava" component={ConnectStravaScreen} />
      </Stack.Navigator>
    );
  }

  return <MainNavigator />;
}
