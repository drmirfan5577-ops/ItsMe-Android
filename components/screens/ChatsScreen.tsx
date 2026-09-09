import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GLOW } from '@/constants/theme';
import { DBConversation } from '@/services/database';
import { ChatItem } from '@/components/feature/ChatItem';
import { MenuItem, FilterChip } from '@/components/ui/CommonComponents';

interface ChatsScreenProps {
  conversations: DBConversation[];
  currentUserId: string;
  onChatPress: (conv: DBConversation) => void;
  onNewChat: () => void;
  onNewGroup: () => void;
  onSearch: () => void;
}

export function ChatsScreen({ conversations, currentUserId, onChatPress, onNewChat, onNewGroup, onSearch }: ChatsScreenProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showMenu, setShowMenu] = useState(false);

  const filtered = conversations.filter(c => {
    const name = c.type === 'direct'
      ? (c.other_user?.username ?? c.other_user?.email ?? '')
      : (c.name ?? '');
    if (filter === 'groups' && c.type !== 'group') return false;
    if (filter === 'direct' && c.type !== 'direct') return false;
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{"It's me"}</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={onSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="search" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowMenu(!showMenu)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="ellipsis-vertical" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {showMenu ? (
        <View style={styles.dropdownMenu}>
          <MenuItem icon="people" title="New Group Chat" onPress={() => { setShowMenu(false); onNewGroup(); }} />
          <MenuItem icon="person-add" title="New Direct Chat" onPress={() => { setShowMenu(false); onNewChat(); }} />
          <MenuItem icon="star-outline" title="Starred Messages" onPress={() => { setShowMenu(false); Alert.alert('Coming soon'); }} />
          <MenuItem icon="archive-outline" title="Archived Chats" onPress={() => { setShowMenu(false); Alert.alert('Coming soon'); }} />
        </View>
      ) : null}

      <View style={styles.filterRow}>
        <FilterChip label="All"    active={filter === 'all'}    onPress={() => setFilter('all')} />
        <FilterChip label="Direct" active={filter === 'direct'} onPress={() => setFilter('direct')} />
        <FilterChip label="Groups" active={filter === 'groups'} onPress={() => setFilter('groups')} />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={15} color={COLORS.textGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations"
          placeholderTextColor={COLORS.textGray}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={COLORS.textGray} />
          </TouchableOpacity>
        ) : null}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptyHint}>Tap + to start chatting</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ChatItem conv={item} currentUserId={currentUserId} onPress={() => onChatPress(item)} />
          )}
        />
      )}

      {/* FABs */}
      <View style={styles.fabRow}>
        <TouchableOpacity style={styles.fabSmall} onPress={onNewGroup}>
          <Ionicons name="people" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab} onPress={onNewChat}>
          <Ionicons name="create" size={26} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.bgLight,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24, fontWeight: '800', color: COLORS.primary,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 10,
  },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { marginLeft: 16, padding: 4 },
  dropdownMenu: {
    position: 'absolute', top: 56, right: 12, backgroundColor: COLORS.bgLighter,
    borderRadius: 14, paddingVertical: 4, zIndex: 100, elevation: 12, minWidth: 210,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 10,
  },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: COLORS.bg, gap: 8,
  },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgLight,
    marginHorizontal: 12, marginBottom: 6, paddingHorizontal: 12, borderRadius: 12,
    height: 40, borderWidth: 1, borderColor: COLORS.border, gap: 8,
  },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  emptyHint: { fontSize: 14, color: COLORS.textMuted },
  fabRow: { position: 'absolute', bottom: 18, right: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  fabSmall: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.bgLighter,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.borderBright,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 6,
  },
  fab: {
    width: 58, height: 58, borderRadius: 29, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', ...GLOW.primary,
  },
});
