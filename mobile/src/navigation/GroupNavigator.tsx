import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GroupStackParamList } from './types';
import GroupListScreen from '../screens/groups/GroupListScreen';
import GroupDetailScreen from '../screens/groups/GroupDetailScreen';
import JoinGroupScreen from '../screens/groups/JoinGroupScreen';

const Stack = createNativeStackNavigator<GroupStackParamList>();

export default function GroupNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="GroupList" component={GroupListScreen} options={{ title: 'Nhóm của tôi' }} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} options={({ route }) => ({ title: route.params.groupName })} />
      <Stack.Screen name="JoinGroup" component={JoinGroupScreen} options={{ title: 'Tham gia nhóm' }} />
    </Stack.Navigator>
  );
}
