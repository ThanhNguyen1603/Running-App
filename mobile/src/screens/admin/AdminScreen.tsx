import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<AdminStackParamList, 'AdminHome'>;

export default function AdminScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản trị</Text>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('CreateChallenge')}>
        <Text style={styles.cardTitle}>Tạo giải chạy</Text>
        <Text style={styles.cardDesc}>Thiết lập tên, thời gian, luật cho giải chạy mới</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('CreateGroup')}>
        <Text style={styles.cardTitle}>Tạo nhóm</Text>
        <Text style={styles.cardDesc}>Tạo nhóm cho một giải và lấy invite code</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20, color: '#222' },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 18,
    marginBottom: 12, elevation: 2,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#FC4C02' },
  cardDesc: { fontSize: 13, color: '#888', marginTop: 4 },
});
