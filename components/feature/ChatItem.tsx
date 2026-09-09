import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GLOW } from '@/constants/theme';
import { DBConversation } from '@/services/database';

interface ChatItemProps {
  conv: DBConversation;
  currentUserId: string;
  onPress: () => void;
}

export const ChatItem = React.memo(({ conv, currentUserId, onPress }: ChatItemProps) => {
  const isGroup = conv.type === 'group';
  const name = isGroup
    ? (conv.name ?? 'Group')
    : (conv.other_user?.username ?? conv.other_user?.email ?? 'Unknown');

  const initial = name.charAt(0).toUpperCase();
  const lastMsg = conv.last_message;
  const lastText = lastMsg?.type === 'image'
    ? '📷 Photo'
    : lastMsg?.type === 'voice'
    ? '🎤 Voice message'
    : lastMsg?.content ?? 'No messages yet';

  const time = lastMsg
    ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  // Pick a deterministic hue for avatar glow
  const hue = name.charCodeAt(0) % 3;
  const avatarColors = [
    { bg: 'rgba(0,229,160,0.15)', border: COLORS.primary, text: COLORS.primary },
    { bg: 'rgba(77,200,255,0.15)', border: COLORS.blue, text: COLORS.blue },
    { bg: 'rgba(192,132,252,0.15)', border: COLORS.purple, text: COLORS.purple },
  ];
  const ac = avatarColors[hue];

  return (
    <TouchableOpacity style={styles.chatItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.avatar, { backgroundColor: ac.bg, borderColor: ac.border }]}>
        <Text style={[styles.avatarText, { color: ac.text }]}>{initial}</Text>
        {!isGroup && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.row}>
          <Text style={styles.chatName} numberOfLines={1}>{name}</Text>
          {time ? <Text style={styles.chatTime}>{time}</Text> : null}
        </View>
        <View style={styles.row}>
          {lastMsg && lastMsg.sender_id === currentUserId ? (
            <Ionicons name="checkmark-done" size={14} color={COLORS.blue} style={{ marginRight: 2 }} />
          ) : null}
          <Text style={styles.lastMsg} numberOfLines={1}>{lastText}</Text>
          {(conv.unread_count ?? 0) > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{conv.unread_count}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10,
    alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 54, height: 54, borderRadius: 27,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12, borderWidth: 1.5, position: 'relative',
  },
  avatarText: { fontSize: 22, fontWeight: '700' },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1, width: 13, height: 13,
    borderRadius: 7, backgroundColor: COLORS.primary, borderWidth: 2, borderColor: COLORS.bg,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 4, elevation: 4,
  },
  chatInfo: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  chatName: { fontSize: 16, color: COLORS.text, fontWeight: '600', flex: 1 },
  chatTime: { fontSize: 11, color: COLORS.textGray, marginLeft: 6 },
  lastMsg: { fontSize: 14, color: COLORS.textMuted, flex: 1 },
  unreadBadge: {
    backgroundColor: COLORS.primary, borderRadius: 10, minWidth: 20, height: 20,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6, marginLeft: 6,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7, shadowRadius: 5, elevation: 5,
  },
  unreadText: { color: '#000', fontSize: 11, fontWeight: '800' },
});
