import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { getChallenges, Challenge } from '../../api/challenges.api';
import { createGroup } from '../../api/groups.api';

export default function CreateGroupScreen() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<string>('');
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdGroup, setCreatedGroup] = useState<{ inviteCode: string; name: string } | null>(null);

  useEffect(() => {
    getChallenges().then(setChallenges).catch(() => Alert.alert('Lỗi', 'Không tải được danh sách giải'));
  }, []);

  async function handleCreate() {
    if (!selectedChallenge || !groupName.trim()) {
      Alert.alert('Lỗi', 'Chọn giải và nhập tên nhóm');
      return;
    }
    setLoading(true);
    try {
      const group = await createGroup(selectedChallenge, groupName.trim());
      setCreatedGroup({ inviteCode: group.inviteCode, name: group.name });
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.error ?? 'Không thể tạo nhóm');
    } finally {
      setLoading(false);
    }
  }

  if (createdGroup) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successTitle}>Nhóm đã tạo thành công!</Text>
        <Text style={styles.successName}>{createdGroup.name}</Text>
        <Text style={styles.codeLabel}>Invite Code</Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{createdGroup.inviteCode}</Text>
        </View>
        <Text style={styles.hint}>Chia sẻ code này cho thành viên để tham gia nhóm.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => { setCreatedGroup(null); setGroupName(''); setSelectedChallenge(''); }}>
          <Text style={styles.btnText}>Tạo nhóm khác</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Chọn giải chạy</Text>
      {challenges.map((c) => (
        <TouchableOpacity
          key={c.id}
          style={[styles.option, selectedChallenge === c.id && styles.optionSelected]}
          onPress={() => setSelectedChallenge(c.id)}
        >
          <Text style={[styles.optionText, selectedChallenge === c.id && styles.optionTextSelected]}>
            {c.name}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={[styles.label, { marginTop: 20 }]}>Tên nhóm</Text>
      <TextInput
        style={styles.input}
        value={groupName}
        onChangeText={setGroupName}
        placeholder="VD: Team Alpha"
      />

      <TouchableOpacity style={styles.btn} onPress={handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Tạo nhóm</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8 },
  option: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 12, marginBottom: 8,
  },
  optionSelected: { borderColor: '#FC4C02', backgroundColor: '#fff3f0' },
  optionText: { fontSize: 15, color: '#333' },
  optionTextSelected: { color: '#FC4C02', fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15,
  },
  btn: {
    backgroundColor: '#FC4C02', borderRadius: 8,
    paddingVertical: 14, alignItems: 'center', marginTop: 24, marginBottom: 40,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#fff' },
  successTitle: { fontSize: 20, fontWeight: '700', color: '#222', marginBottom: 8 },
  successName: { fontSize: 16, color: '#FC4C02', marginBottom: 24 },
  codeLabel: { fontSize: 13, color: '#888', marginBottom: 8 },
  codeBox: {
    backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 32, paddingVertical: 16,
  },
  codeText: { fontSize: 28, fontWeight: '800', letterSpacing: 6, color: '#222' },
  hint: { fontSize: 13, color: '#888', textAlign: 'center', marginTop: 16, marginBottom: 24 },
});
