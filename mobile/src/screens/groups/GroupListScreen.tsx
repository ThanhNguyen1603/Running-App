import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GroupStackParamList } from '../../navigation/types';
import { getMyGroups, Group } from '../../api/groups.api';
import { formatDate } from '../../utils/formatters';

type Nav = NativeStackNavigationProp<GroupStackParamList, 'GroupList'>;

export default function GroupListScreen() {
  const navigation = useNavigation<Nav>();
  const [groups, setGroups] = useState<Group[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await getMyGroups();
      setGroups(data);
    } catch {
      Alert.alert('Lỗi', 'Không thể tải danh sách nhóm');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        keyExtractor={(g) => g.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        contentContainerStyle={groups.length === 0 ? styles.empty : undefined}
        ListEmptyComponent={
          !refreshing ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Bạn chưa tham gia nhóm nào</Text>
              <TouchableOpacity style={styles.joinBtn} onPress={() => navigation.navigate('JoinGroup')}>
                <Text style={styles.joinBtnText}>Tham gia nhóm</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('GroupDetail', { groupId: item.id, groupName: item.name })}
          >
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={styles.challengeName}>{item.challenge.name}</Text>
            <View style={styles.row}>
              <Text style={styles.meta}>{item._count.members} thành viên</Text>
              <Text style={styles.meta}>{formatDate(item.challenge.endDate)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      {groups.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('JoinGroup')}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  empty: { flex: 1 },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 16, color: '#999', marginBottom: 20 },
  card: {
    backgroundColor: '#fff', margin: 12, marginBottom: 0,
    borderRadius: 12, padding: 16, elevation: 2,
  },
  groupName: { fontSize: 18, fontWeight: '700', color: '#222' },
  challengeName: { fontSize: 14, color: '#FC4C02', marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  meta: { fontSize: 13, color: '#888' },
  joinBtn: {
    backgroundColor: '#FC4C02', borderRadius: 8,
    paddingVertical: 12, paddingHorizontal: 32,
  },
  joinBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    backgroundColor: '#FC4C02', width: 52, height: 52,
    borderRadius: 26, justifyContent: 'center', alignItems: 'center', elevation: 4,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
});
