import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '../../stores/authStore';
import { apiClient } from '../../api/client';

export default function ConnectStravaScreen() {
  const [loading, setLoading] = useState(false);
  const { logout } = useAuthStore();

  async function handleConnect() {
    setLoading(true);
    try {
      const { data } = await apiClient.get<{ url: string }>('/strava/connect');
      const result = await WebBrowser.openAuthSessionAsync(data.url, 'runningapp://strava');
      if (result.type === 'cancel') {
        Alert.alert('Đã hủy', 'Bạn đã hủy kết nối Strava');
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.error ?? 'Không thể kết nối Strava');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🏃</Text>
      <Text style={styles.title}>Kết nối Strava</Text>
      <Text style={styles.desc}>
        Để theo dõi hoạt động chạy bộ, bạn cần kết nối tài khoản Strava của mình.
      </Text>

      <TouchableOpacity style={styles.btn} onPress={handleConnect} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Kết nối với Strava</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  logo: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 12, color: '#222' },
  desc: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 40, lineHeight: 22 },
  btn: {
    backgroundColor: '#FC4C02', borderRadius: 8,
    paddingVertical: 14, paddingHorizontal: 40,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  logoutBtn: { marginTop: 24 },
  logoutText: { color: '#999', fontSize: 14 },
});
