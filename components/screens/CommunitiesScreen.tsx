import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { mockCommunities } from '@/services/mockData';

export function CommunitiesScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Communities</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.textGray} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockCommunities}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <TouchableOpacity style={styles.newCommunity} onPress={() => Alert.alert('New Community')}>
            <View style={styles.newCommunityIcon}>
              <Ionicons name="add" size={28} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.newCommunityTitle}>New community</Text>
              <Text style={styles.newCommunityDesc}>Create a community to connect groups</Text>
            </View>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.communityItem} onPress={() => Alert.alert(item.name)}>
            <View style={styles.communityAvatar}>
              <Text style={styles.avatarText}>🏛️</Text>
            </View>
            <View style={styles.communityInfo}>
              <Text style={styles.communityName}>{item.name}</Text>
              <Text style={styles.communityMeta}>{item.members} members · {item.groups} groups</Text>
              <Text style={styles.communityDesc}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textGray} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.bgLight },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  iconBtn: { padding: 4 },
  newCommunity: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.bgLighter },
  newCommunityIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.bgLighter, justifyContent: 'center', alignItems: 'center', marginRight: 14, borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed' },
  newCommunityTitle: { fontSize: 16, color: COLORS.text, fontWeight: '500' },
  newCommunityDesc: { fontSize: 13, color: COLORS.textGray, marginTop: 2 },
  communityItem: { flexDirection: 'row', padding: 14, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.bgLighter },
  communityAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primaryDark, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText: { fontSize: 24 },
  communityInfo: { flex: 1 },
  communityName: { fontSize: 16, color: COLORS.text, fontWeight: '500', marginBottom: 2 },
  communityMeta: { fontSize: 13, color: COLORS.primary, marginBottom: 2 },
  communityDesc: { fontSize: 13, color: COLORS.textGray },
});
