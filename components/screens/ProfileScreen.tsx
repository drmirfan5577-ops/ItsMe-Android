import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GLOW } from '@/constants/theme';
import { useAuth } from '@/template';

interface ProfileScreenProps {
  onSettings: () => void;
  onLogout: () => void;
}

export function ProfileScreen({ onSettings, onLogout }: ProfileScreenProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  const displayName = user?.username ?? user?.email?.split('@')[0] ?? 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={styles.avatarGlow} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="pencil" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Status card */}
        <View style={styles.statusCard}>
          <Ionicons name="chatbubble-ellipses" size={18} color={COLORS.primary} />
          <Text style={styles.statusText}>{"Hey there! I'm using It's me 👋"}</Text>
          <TouchableOpacity style={{ marginLeft: 8 }}>
            <Ionicons name="pencil-outline" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Item icon="person-outline" label="Account" sub="Security & privacy" onPress={() => {}} />
          <Item icon="lock-closed-outline" label="Privacy" sub="Status, last seen, profile photo" onPress={() => {}} />
          <Item icon="notifications-outline" label="Notifications" sub="Message & call tones" onPress={() => {}} />
          <Item icon="chatbubble-ellipses-outline" label="Chats" sub="Theme, wallpapers, backup" onPress={() => {}} />
          <Item icon="data-management" label="Storage & data" sub="Network usage, auto-download" onPress={() => {}} />
          <Item icon="help-circle-outline" label="Help" sub="Help center, contact us" onPress={() => {}} />
          <Item icon="settings-outline" label="App settings" sub="Advanced settings" onPress={onSettings} />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>{"It's me v1.0.0 · Secure Messaging"}</Text>
      </ScrollView>
    </View>
  );
}

function Item({ icon, label, sub, onPress }: { icon: string; label: string; sub?: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.itemIcon}>
        <Ionicons name={icon as any} size={20} color={COLORS.primary} />
      </View>
      <View style={styles.itemText}>
        <Text style={styles.itemLabel}>{label}</Text>
        {sub ? <Text style={styles.itemSub}>{sub}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLORS.textGray} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.bgLight,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: COLORS.bgLight,
    marginBottom: 1, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  avatarWrap: { position: 'relative', marginRight: 16 },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.primary,
    ...GLOW.primary,
  },
  avatarGlow: {
    position: 'absolute', inset: -6, borderRadius: 42,
    backgroundColor: 'transparent',
  },
  avatarText: { fontSize: 30, fontWeight: '700', color: COLORS.primary },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  profileEmail: { fontSize: 13, color: COLORS.textMuted },
  editBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderBright,
  },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgLight,
    padding: 14, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  statusText: { flex: 1, fontSize: 14, color: COLORS.textMuted, marginLeft: 10 },
  section: { backgroundColor: COLORS.bgLight, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  itemIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center', marginRight: 14, borderWidth: 1, borderColor: COLORS.borderBright,
  },
  itemText: { flex: 1 },
  itemLabel: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
  itemSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    padding: 16, backgroundColor: 'rgba(255,61,107,0.08)',
    borderRadius: 12, marginHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255,61,107,0.3)',
  },
  logoutText: { fontSize: 16, color: COLORS.red, fontWeight: '700' },
  version: { color: COLORS.textGray, fontSize: 12, textAlign: 'center', padding: 24, paddingTop: 12 },
});
