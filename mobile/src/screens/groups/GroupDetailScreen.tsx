import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  RefreshControl, Alert, TouchableOpacity,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { GroupStackParamList } from '../../navigation/types';
import { getLeaderboard, LeaderboardEntry, getGroupById } from '../../api/groups.api';
import { syncActivities } from '../../api/activities.api';
import { formatPace, formatDistance } from '../../utils/formatters';

type Route = RouteProp<GroupStackParamList, 'GroupDetail'>;

interface ChallengeInfo {
  name: string;
  monthlyKmGoal: number;
  minDaysPerWeek: number;
  minPaceSecPerKm: number | null;
  maxPaceSecPerKm: number | null;
}

export default function GroupDetailScreen() {
  const { params } = useRoute<Route>();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [challenge, setChallenge] = useState<ChallengeInfo | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [lb, group] = await Promise.all([
        getLeaderboard(params.groupId),
        getGroupById(params.groupId),
      ]);
      setLeaderboard(lb);
      setChallenge(group.challenge);
    } catch {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setRefreshing(false);
    }
  }, [params.groupId]);

  React.useEffect(() => { load(); }, [load]);

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await syncActivities();
      Alert.alert('Đồng bộ xong', res.message);
      load();
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.error ?? 'Không thể đồng bộ');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <View style={styles.container}>
      {challenge && (
        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>Luật giải: {challenge.name}</Text>
          <Text style={styles.rule}>Mục tiêu: {challenge.monthlyKmGoal} km/tháng</Text>
          <Text style={styles.rule}>Ngày chạy tối thiểu: {challenge.minDaysPerWeek} ngày/tuần</Text>
          {challenge.minPaceSecPerKm && (
            <Text style={styles.rule}>Pace chậm nhất: {formatPace(challenge.minPaceSecPerKm)}</Text>
          )}
          {challenge.maxPaceSecPerKm && (
            <Text style={styles.rule}>Pace nhanh nhất: {formatPace(challenge.maxPaceSecPerKm)}</Text>
          )}
        </View>
      )}

      <View style={styles.syncRow}>
        <Text style={styles.sectionTitle}>Bảng xếp hạng</Text>
        <TouchableOpacity style={styles.syncBtn} onPress={handleSync} disabled={syncing}>
          <Text style={styles.syncBtnText}>{syncing ? 'Đang sync...' : '↻ Sync'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={leaderboard}
        keyExtractor={(e) => e.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={[styles.rank, index < 3 && styles.topRank]}>{index + 1}</Text>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>{item.activeDays} ngày · {item.activeWeeks} tuần</Text>
            </View>
            <Text style={styles.km}>{Number(item.totalKm).toFixed(1)} km</Text>
          </View>
        )}
        ListEmptyComponent={
          !refreshing ? <Text style={styles.empty}>Chưa có dữ liệu</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  rulesCard: {
    backgroundColor: '#fff3f0', margin: 12, borderRadius: 10,
    padding: 14, borderLeftWidth: 4, borderLeftColor: '#FC4C02',
  },
  rulesTitle: { fontWeight: '700', fontSize: 15, marginBottom: 6, color: '#FC4C02' },
  rule: { fontSize: 13, color: '#444', marginTop: 2 },
  syncRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  syncBtn: { backgroundColor: '#FC4C02', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 },
  syncBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 8,
    borderRadius: 10, padding: 14,
  },
  rank: { fontSize: 18, fontWeight: '700', width: 30, color: '#888' },
  topRank: { color: '#FC4C02' },
  info: { flex: 1, marginLeft: 8 },
  name: { fontSize: 15, fontWeight: '600', color: '#222' },
  sub: { fontSize: 12, color: '#888', marginTop: 2 },
  km: { fontSize: 16, fontWeight: '700', color: '#FC4C02' },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
});
