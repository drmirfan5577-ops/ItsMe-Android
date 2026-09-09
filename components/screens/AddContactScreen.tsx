import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/template';
import { searchUsers, DBProfile } from '@/services/database';
import { COLORS, GLOW } from '@/constants/theme';

interface AddContactScreenProps {
  onBack: () => void;
  onStartChat: (userId: string, name: string) => void;
}

export function AddContactScreen({ onBack, onStartChat }: AddContactScreenProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DBProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || !user?.id) return;
    setLoading(true);
    setSearched(true);
    const data = await searchUsers(query.trim(), user.id);
    setResults(data);
    setLoading(false);
  }, [query, user?.id]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Find People</Text>
          <Text style={styles.headerSub}>Search by username or email</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} style={{ marginLeft: 12 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Username or email..."
            placeholderTextColor={COLORS.textGray}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : searched && results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No users found</Text>
          <Text style={styles.emptyHint}>Try a different username or email</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => onStartChat(item.id, item.username ?? item.email)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(item.username ?? item.email).charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.username ?? item.email}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
              </View>
              <View style={styles.chatBtn}>
                <Ionicons name="chatbubble" size={18} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {!searched && (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyText}>Find your contacts</Text>
          <Text style={styles.emptyHint}>Search to start a new conversation</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
    paddingVertical: 12, backgroundColor: COLORS.bgLight,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  searchRow: { flexDirection: 'row', padding: 12, gap: 10 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgLight, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, minHeight: 46,
  },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 15, paddingHorizontal: 10, paddingVertical: 12 },
  searchBtn: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    ...GLOW.primary,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  emptyHint: { fontSize: 14, color: COLORS.textMuted },
  userItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
    borderWidth: 1, borderColor: COLORS.borderBright,
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  userEmail: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  chatBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.borderBright,
  },
});
