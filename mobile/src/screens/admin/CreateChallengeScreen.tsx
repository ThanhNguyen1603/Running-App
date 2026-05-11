import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createChallenge } from '../../api/challenges.api';

export default function CreateChallengeScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    monthlyKmGoal: '',
    minDaysPerWeek: '',
    minPaceSecPerKm: '',
    maxPaceSecPerKm: '',
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCreate() {
    if (!form.name || !form.startDate || !form.endDate || !form.monthlyKmGoal || !form.minDaysPerWeek) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    setLoading(true);
    try {
      await createChallenge({
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate,
        monthlyKmGoal: Number(form.monthlyKmGoal),
        minDaysPerWeek: Number(form.minDaysPerWeek),
        minPaceSecPerKm: form.minPaceSecPerKm ? Number(form.minPaceSecPerKm) : null,
        maxPaceSecPerKm: form.maxPaceSecPerKm ? Number(form.maxPaceSecPerKm) : null,
      });
      Alert.alert('Thành công', 'Đã tạo giải chạy', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.error ?? 'Không thể tạo giải');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Tên giải *</Text>
      <TextInput style={styles.input} value={form.name} onChangeText={(v) => set('name', v)} placeholder="VD: Tháng 5 Challenge" />

      <Text style={styles.label}>Ngày bắt đầu * (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={form.startDate} onChangeText={(v) => set('startDate', v)} placeholder="2025-05-01" />

      <Text style={styles.label}>Ngày kết thúc * (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={form.endDate} onChangeText={(v) => set('endDate', v)} placeholder="2025-05-31" />

      <Text style={styles.label}>Mục tiêu km/tháng *</Text>
      <TextInput style={styles.input} value={form.monthlyKmGoal} onChangeText={(v) => set('monthlyKmGoal', v)} keyboardType="numeric" placeholder="100" />

      <Text style={styles.label}>Số ngày chạy tối thiểu/tuần *</Text>
      <TextInput style={styles.input} value={form.minDaysPerWeek} onChangeText={(v) => set('minDaysPerWeek', v)} keyboardType="numeric" placeholder="3" />

      <Text style={styles.label}>Pace chậm nhất (giây/km, tuỳ chọn)</Text>
      <TextInput style={styles.input} value={form.minPaceSecPerKm} onChangeText={(v) => set('minPaceSecPerKm', v)} keyboardType="numeric" placeholder="600 (= 10:00/km)" />

      <Text style={styles.label}>Pace nhanh nhất (giây/km, tuỳ chọn)</Text>
      <TextInput style={styles.input} value={form.maxPaceSecPerKm} onChangeText={(v) => set('maxPaceSecPerKm', v)} keyboardType="numeric" placeholder="240 (= 4:00/km)" />

      <TouchableOpacity style={styles.btn} onPress={handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Tạo giải chạy</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 4, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15,
  },
  btn: {
    backgroundColor: '#FC4C02', borderRadius: 8,
    paddingVertical: 14, alignItems: 'center', marginTop: 24, marginBottom: 40,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
