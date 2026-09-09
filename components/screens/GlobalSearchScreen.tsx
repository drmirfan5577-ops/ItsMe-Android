import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { DBConversation, DBMessage } from '@/services/database';
import { getSupabaseClient } from '@/template';
import { useAuth } from '@/template';

interface GlobalSearchScreenProps {
  conversations: DBConversation[];
  onClose: () => void;
  onOpenChat: (conv: DBConversation) => void;
}

interface SearchResult {
  type: 'chat' | 'message';
  conv: DBConversation;
  message?: DBMessage;
  highlight?: string;
}

export function GlobalSearchScreen({ conversations, onClose, onOpenChat }: GlobalSearchScreenProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (text.trim().length < 2) { setResults([]); return; }
    setLoading(true);

    const lowerQ = text.toLowerCase();

    // Search chat names
    const chatHits: SearchResult[] = conversations
      .filter(c => {
        const name = c.type === 'direct'
          ? (c.other_user?.username ?? c.other_user?.email ?? '')
          : (c.name ?? '');
        return name.toLowerCase().includes(lowerQ);
      })
      .map(c => ({ type: 'chat', conv: c }));

    // Search messages in all conversations
    const db = getSupabaseClient();
    const convIds = conversations.map(c => c.id);
    let msgHits: SearchResult[] = [];

    if (convIds.length > 0) {
      const { data: msgs } = await db
        .from('messages')
        .select('*, sender:user_profiles!sender_id(username, email)')
        .in('conversation_id', convIds)
        .ilike('content', `%${text}%`)
        .order('created_at', { ascending: false })
        .limit(30);

      if (msgs?.length) {
        msgHits = msgs.map((msg: DBMessage) => {
          const conv = conversations.find(c => c.id === msg.conversation_id)!;
          return { type: 'message', conv, message: msg, highlight: msg.content };
        }).filter(r => r.conv);
      }
    }

    setResults([...chatHits, ...msgHits]);
    setLoading(false);
  }, [conversations]);

  const getConvName = (conv: DBConversation) =>
    conv.type === 'direct'
      ? (conv.other_user?.username ?? conv.other_user?.email ?? 'Unknown')
      : (conv.name ?? 'Group');

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats and messages..."
          placeholderTextColor={COLORS.textGray}
          value={query}
          onChangeText={doSearch}
          autoFocus
          autoCapitalize="none"
        />
        {query.length > 0 ? (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }} style={{ padding: 8 }}>
            <Ionicons name="close" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : results.length === 0 && query.length >= 2 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No results for "{query}"</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, index) => `${item.type}-${item.message?.id ?? item.conv.id}-${index}`}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={results.length > 0 ? (
            <Text style={styles.sectionLabel}>{results.length} result{results.length !== 1 ? 's' : ''}</Text>
          ) : null}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem} onPress={() => onOpenChat(item.conv)}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getConvName(item.conv).charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.resultInfo}>
                <View style={styles.resultRow}>
                  <Text style={styles.resultName}>{getConvName(item.conv)}</Text>
                  <View style={[styles.badge, item.type === 'message' ? styles.badgeMsg : styles.badgeChat]}>
                    <Text style={styles.badgeText}>{item.type}</Text>
                  </View>
                </View>
                {item.message ? (
                  <Text style={styles.resultPreview} numberOfLines={2}>{item.message.content}</Text>
                ) : (
                  <Text style={styles.resultPreview}>Tap to open</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {query.length < 2 && (
        <View style={styles.center}>
          <Ionicons name="search" size={48} color={COLORS.textGray} />
          <Text style={styles.hintText}>Search across all chats</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8,
    paddingVertical: 8, backgroundColor: COLORS.bgLight,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 8 },
  searchInput: {
    flex: 1, color: COLORS.text, fontSize: 16, paddingHorizontal: 8, paddingVertical: 12,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
  emptyText: { color: COLORS.textMuted, fontSize: 15, marginTop: 12 },
  sectionLabel: { color: COLORS.textMuted, fontSize: 13, paddingHorizontal: 16, paddingVertical: 10 },
  resultItem: {
    flexDirection: 'row', padding: 12, borderBottomWidth: 1,
    borderBottomColor: COLORS.border, alignItems: 'center',
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
    borderWidth: 1, borderColor: COLORS.borderBright,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  resultInfo: { flex: 1 },
  resultRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  resultName: { fontSize: 15, fontWeight: '600', color: COLORS.text, flex: 1 },
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeChat: { backgroundColor: 'rgba(0,229,160,0.15)' },
  badgeMsg: { backgroundColor: 'rgba(77,200,255,0.15)' },
  badgeText: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted },
  resultPreview: { fontSize: 13, color: COLORS.textMuted },
  hintText: { fontSize: 15, color: COLORS.textGray, marginTop: 12 },
});
