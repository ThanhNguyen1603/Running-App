import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { disconnectStrava } from '../api/strava.api';
import { syncActivities } from '../api/activities.api';

export default function ProfileScreen() {
  const { userName, avatarUrl, isAdmin, stravaConnected, logout, setStravaConnected } = useAuthStore();
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await syncActivities();
      Alert.alert('Đồng bộ xong', res.message);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.error ?? 'Không thể đồng bộ');
    } finally {
      setSyncing(false);
    }
  }

  async function handleDisconnect() {
    Alert.alert('Ngắt kết nối Strava', 'Bạn có chắc muốn ngắt kết nối?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Ngắt kết nối',
        style: 'destructive',
        onPress: async () => {
          try {
            await disconnectStrava();
            setStravaConnected(false);
          } catch {
            Alert.alert('Lỗi', 'Không thể ngắt kết nối');
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarBox}>
        <Text style={styles.avatar}>👤</Text>
        <Text style={styles.name}>{userName}</Text>
        {isAdmin && <View style={styles.badge}><Text style={styles.badgeText}>Admin</Text></View>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Strava</Text>
        <View style={styles.stravaRow}>
          <Text style={styles.stravaStatus}>
            {stravaConnected ? '✅ Đã kết nối' : '❌ Chưa kết nối'}
          </Text>
        </View>
        {stravaConnected && (
          <>
            <TouchableOpacity style={styles.btn} onPress={handleSync} disabled={syncing}>
              {syncing ? <ActivityIndicator color="#FC4C02" /> : <Text style={styles.btnText}>Đồng bộ hoạt động</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.dangerBtn} onPress={handleDisconnect}>
              <Text style={styles.dangerBtnText}>Ngắt kết nối Strava</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  avatarBox: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#fff' },
  avatar: { fontSize: 56 },
  name: { fontSize: 20, fontWeight: '700', marginTop: 8, color: '#222' },
  badge: {
    backgroundColor: '#FC4C02', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 2, marginTop: 6,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  section: { backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 16 },
  sectionLabel: { fontSize: 13, color: '#888', fontWeight: '600', marginBottom: 10 },
  stravaRow: { marginBottom: 12 },
  stravaStatus: { fontSize: 15, color: '#333' },
  btn: {
    borderWidth: 1, borderColor: '#FC4C02', borderRadius: 8,
    paddingVertical: 10, alignItems: 'center', marginBottom: 8,
  },
  btnText: { color: '#FC4C02', fontWeight: '600' },
  dangerBtn: {
    borderWidth: 1, borderColor: '#e53e3e', borderRadius: 8,
    paddingVertical: 10, alignItems: 'center',
  },
  dangerBtnText: { color: '#e53e3e', fontWeight: '600' },
  logoutBtn: { margin: 12, borderRadius: 8, paddingVertical: 14, alignItems: 'center', backgroundColor: '#fff' },
  logoutText: { color: '#e53e3e', fontWeight: '600', fontSize: 15 },
});
