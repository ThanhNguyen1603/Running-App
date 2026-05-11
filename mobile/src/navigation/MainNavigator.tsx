import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { MainTabParamList } from './types';
import { useAuthStore } from '../stores/authStore';
import GroupNavigator from './GroupNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import AdminNavigator from './AdminNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  const isAdmin = useAuthStore((s) => s.isAdmin);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: () => {
          const icons: Record<string, string> = { Groups: '👥', Profile: '👤', Admin: '⚙️' };
          return <Text>{icons[route.name] ?? '•'}</Text>;
        },
      })}
    >
      <Tab.Screen name="Groups" component={GroupNavigator} options={{ title: 'Nhóm' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Tôi' }} />
      {isAdmin && <Tab.Screen name="Admin" component={AdminNavigator} options={{ title: 'Admin' }} />}
    </Tab.Navigator>
  );
}
