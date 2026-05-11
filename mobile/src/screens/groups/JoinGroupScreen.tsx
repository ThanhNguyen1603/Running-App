import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GroupStackParamList } from '../../navigation/types';
import { joinGroup } from '../../api/groups.api';

type Nav = NativeStackNavigationProp<GroupStackParamList, 'JoinGroup'>;

export default function JoinGroupScreen() {
  const navigation = useNavigation<Nav>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    if (!code.trim()) {
      Alert.alert('Lỗi', 'Nhập invite code');
      return;
    }
    setLoading(true);
    try {
      const res = await joinGroup(code.trim().toUpperCase());
      Alert.alert('Thành công', `Đã tham gia nhóm "${res.groupName}"`, [
        { text: 'OK', onPress: () => navigation.navigate('GroupDetail', { groupId: res.groupId, groupName: res.groupName }) },
      ]);
    } catch (err: any) {
      Alert.alert('Thất bại', err?.response?.data?.error ?? 'Invite code không hợp lệ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nhập invite code</Text>
      <Text style={styles.desc}>Lấy invite code từ admin hoặc thành viên trong nhóm.</Text>

      <TextInput
        style={styles.input}
        placeholder="VD: ABCD1234"
        autoCapitalize="characters"
        value={code}
        onChangeText={setCode}
        maxLength={20}
      />

      <TouchableOpacity style={styles.btn} onPress={handleJoin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Tham gia</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8, color: '#222' },
  desc: { fontSize: 14, color: '#888', marginBottom: 24 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 18,
    letterSpacing: 4, textAlign: 'center', marginBottom: 16,
  },
  btn: {
    backgroundColor: '#FC4C02', borderRadius: 8,
    paddingVertical: 14, alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
