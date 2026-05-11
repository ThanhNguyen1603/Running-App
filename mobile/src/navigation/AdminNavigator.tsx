import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminStackParamList } from './types';
import AdminScreen from '../screens/admin/AdminScreen';
import CreateChallengeScreen from '../screens/admin/CreateChallengeScreen';
import CreateGroupScreen from '../screens/admin/CreateGroupScreen';

const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminHome" component={AdminScreen} options={{ title: 'Quản trị' }} />
      <Stack.Screen name="CreateChallenge" component={CreateChallengeScreen} options={{ title: 'Tạo giải chạy' }} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ title: 'Tạo nhóm' }} />
    </Stack.Navigator>
  );
}
