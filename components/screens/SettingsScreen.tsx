import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GLOW } from '@/constants/theme';
import { useAuth } from '@/template';

interface SettingsScreenProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  onOpenAdmin: () => void;
  onOpenDocs: () => void;
}

export function SettingsScreen({ onBack, darkMode, setDarkMode, onOpenAdmin, onOpenDocs }: SettingsScreenProps) {
  const { user, logout } = useAuth();
  const displayName = user?.username ?? user?.email?.split('@')[0] ?? 'User';

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile summary */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>

        <Section>
          <Item icon="person-outline"    label="Account"        sub="Security, privacy"       onPress={() => {}} />
          <Item icon="lock-closed-outline" label="Privacy"      sub="Block contacts, status"  onPress={() => {}} />
          <Item icon="chatbubble-ellipses-outline" label="Chats" sub="Theme, wallpapers"      onPress={() => {}} />
          <Item icon="notifications-outline" label="Notifications" sub="Message tones, alerts" onPress={() => {}} />
          <Item icon="moon-outline"      label="Dark Mode"      sub={darkMode ? 'Enabled' : 'Disabled'} onPress={() => setDarkMode(!darkMode)} rightIcon={darkMode ? 'checkmark-circle' : 'ellipse-outline'} rightColor={darkMode ? COLORS.primary : COLORS.textGray} />
        </Section>

        <Section>
          <Item icon="shield-checkmark-outline" label="Admin Panel" sub="Owner access only — password protected" onPress={onOpenAdmin} highlight />
        </Section>

        <Section>
          <Item icon="document-text-outline" label="Legal & Docs" sub="Privacy, Terms, Disclaimer" onPress={onOpenDocs} />
          <Item icon="help-circle-outline"   label="Help Center"  sub="FAQ and support"             onPress={() => {}} />
          <Item icon="information-circle-outline" label="About"   sub={"It's me v1.0.0"}              onPress={() => {}} />
        </Section>

        <TouchableOpacity style={styles.logoutBtn} onPress={async () => { await logout(); }}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>{"It's me v1.0.0 · Private & Secure"}</Text>
      </ScrollView>
    </View>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <View style={styles.section}>{children}</View>;
}

function Item({ icon, label, sub, onPress, highlight, rightIcon, rightColor }: {
  icon: string; label: string; sub?: string; onPress: () => void;
  highlight?: boolean; rightIcon?: string; rightColor?: string;
}) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={[styles.itemIcon, highlight && styles.itemIconHL]}>
        <Ionicons name={icon as any} size={20} color={highlight ? '#000' : COLORS.primary} />
      </View>
      <View style={styles.itemText}>
        <Text style={[styles.itemLabel, highlight && styles.itemLabelHL]}>{label}</Text>
        {sub ? <Text style={styles.itemSub}>{sub}</Text> : null}
      </View>
      {rightIcon ? (
        <Ionicons name={rightIcon as any} size={20} color={rightColor ?? COLORS.textGray} />
      ) : (
        <Ionicons name="chevron-forward" size={16} color={COLORS.textGray} />
      )}
    </TouchableOpacity>
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
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', color: COLORS.primary },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    backgroundColor: COLORS.bgLight, marginBottom: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
    borderWidth: 2, borderColor: COLORS.primary, ...GLOW.primary,
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: COLORS.primary },
  profileName: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  profileEmail: { fontSize: 13, color: COLORS.textMuted },
  section: { backgroundColor: COLORS.bgLight, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  item: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  itemIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
    borderWidth: 1, borderColor: COLORS.borderBright,
  },
  itemIconHL: { backgroundColor: COLORS.primary, ...GLOW.primary },
  itemText: { flex: 1 },
  itemLabel: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
  itemLabelHL: { color: COLORS.primary, fontWeight: '700' },
  itemSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    margin: 16, padding: 16, backgroundColor: 'rgba(255,61,107,0.08)',
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,61,107,0.3)',
  },
  logoutText: { fontSize: 16, color: COLORS.red, fontWeight: '700' },
  version: { color: COLORS.textGray, fontSize: 12, textAlign: 'center', paddingBottom: 16 },
});
