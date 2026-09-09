import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GLOW } from '@/constants/theme';
import { DBConversation } from '@/services/database';

interface ChatInfoScreenProps {
  conv: DBConversation;
  onBack: () => void;
}

export function ChatInfoScreen({ conv, onBack }: ChatInfoScreenProps) {
  const isGroup = conv.type === 'group';
  const name = isGroup
    ? (conv.name ?? 'Group')
    : (conv.other_user?.username ?? conv.other_user?.email ?? 'Chat');

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isGroup ? 'Group Info' : 'Contact Info'}</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{name}</Text>
        {conv.other_user ? (
          <Text style={styles.sub}>{conv.other_user.email}</Text>
        ) : null}
        {isGroup ? (
          <Text style={styles.sub}>{conv.members?.length ?? 0} members</Text>
        ) : null}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="call" size={22} color={COLORS.primary} />
          <Text style={styles.actionLabel}>Voice</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="videocam" size={22} color={COLORS.primary} />
          <Text style={styles.actionLabel}>Video</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="notifications" size={22} color={COLORS.primary} />
          <Text style={styles.actionLabel}>Mute</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="search" size={22} color={COLORS.primary} />
          <Text style={styles.actionLabel}>Search</Text>
        </TouchableOpacity>
      </View>

      {isGroup && conv.members ? (
        <View style={styles.memberSection}>
          <Text style={styles.sectionTitle}>Members ({conv.members.length})</Text>
          {conv.members.map(m => (
            <View key={m.user_id} style={styles.memberRow}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>{(m.username ?? 'U').charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.memberName}>{m.username ?? 'User'}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: COLORS.bgLight, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  profileSection: { alignItems: 'center', paddingVertical: 32, backgroundColor: COLORS.bgLight, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  avatar: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    borderWidth: 2, borderColor: COLORS.primary, ...GLOW.primary,
  },
  avatarText: { fontSize: 40, fontWeight: '700', color: COLORS.primary },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  sub: { fontSize: 14, color: COLORS.textMuted },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.bgLight, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  actionBtn: { alignItems: 'center', gap: 6 },
  actionLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  memberSection: { backgroundColor: COLORS.bgLight, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 14, color: COLORS.textMuted, fontWeight: '700', marginBottom: 12 },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryDim, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: COLORS.borderBright },
  memberAvatarText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  memberName: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
});
