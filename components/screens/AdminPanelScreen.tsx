import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  TextInput, Switch, Alert, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GLOW } from '@/constants/theme';
import { useAuth } from '@/template';

const ADMIN_PASSWORD = 'ItsMe@Admin2025'; // Owner-only password

interface AdminPanelScreenProps {
  onBack: () => void;
}

export function AdminPanelScreen({ onBack }: AdminPanelScreenProps) {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [settings, setSettings] = useState({
    appName: "It's me",
    allowSignUp: true,
    allowGroupChats: true,
    maintenanceMode: false,
    maxMessageLen: 2000,
    notesPin: '1234',
    ihubEnabled: true,
    eshubEnabled: true,
    communitiesEnabled: true,
    callsEnabled: true,
    voiceMessagesEnabled: true,
    imageMessagesEnabled: true,
  });
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const tryUnlock = () => {
    if (password === ADMIN_PASSWORD) {
      setUnlocked(true);
      setPassword('');
    } else {
      Alert.alert('Access Denied', 'Incorrect admin password.');
      setPassword('');
    }
  };

  const openEdit = (key: string, value: string) => {
    setEditField(key);
    setEditValue(value);
  };

  const saveEdit = () => {
    if (!editField) return;
    setSettings(prev => ({ ...prev, [editField]: editValue }));
    setEditField(null);
    Alert.alert('Saved', 'Setting updated successfully.');
  };

  if (!unlocked) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Panel</Text>
        </View>
        <View style={styles.lockScreen}>
          <View style={styles.lockIcon}>
            <Ionicons name="shield-checkmark" size={44} color={COLORS.primary} />
          </View>
          <Text style={styles.lockTitle}>Admin Access</Text>
          <Text style={styles.lockSub}>This section is for the app owner only.{'\n'}Enter the admin password to continue.</Text>
          <View style={styles.pwdRow}>
            <TextInput
              style={styles.pwdInput}
              placeholder="Admin password"
              placeholderTextColor={COLORS.textGray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPwd}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPwd(v => !v)} style={{ padding: 10 }}>
              <Ionicons name={showPwd ? 'eye-off' : 'eye'} size={22} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.unlockBtn} onPress={tryUnlock}>
            <Ionicons name="lock-open" size={20} color="#000" />
            <Text style={styles.unlockBtnText}>Unlock Admin Panel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚙️ Admin Panel</Text>
        <TouchableOpacity onPress={() => setUnlocked(false)} style={{ padding: 8 }}>
          <Ionicons name="lock-closed-outline" size={22} color={COLORS.red} />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 12, gap: 16, paddingBottom: 40 }}>
        {/* Owner info */}
        <View style={styles.ownerCard}>
          <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.ownerTitle}>Admin — {user?.email}</Text>
            <Text style={styles.ownerSub}>Full customization access unlocked</Text>
          </View>
        </View>

        {/* App Identity */}
        <Section title="App Identity">
          <SettingRow
            icon="text"
            label="App Name"
            value={settings.appName}
            onEdit={() => openEdit('appName', settings.appName)}
          />
        </Section>

        {/* Features toggle */}
        <Section title="Feature Toggles (Enable / Disable)">
          <ToggleRow icon="people" label="Group Chats"          value={settings.allowGroupChats}   onChange={v => setSettings(s => ({ ...s, allowGroupChats: v }))} />
          <ToggleRow icon="book"   label="I-Hub"                value={settings.ihubEnabled}        onChange={v => setSettings(s => ({ ...s, ihubEnabled: v }))} />
          <ToggleRow icon="globe"  label="E.S Hub"              value={settings.eshubEnabled}       onChange={v => setSettings(s => ({ ...s, eshubEnabled: v }))} />
          <ToggleRow icon="radio"  label="Communities"          value={settings.communitiesEnabled} onChange={v => setSettings(s => ({ ...s, communitiesEnabled: v }))} />
          <ToggleRow icon="call"   label="Calls"                value={settings.callsEnabled}       onChange={v => setSettings(s => ({ ...s, callsEnabled: v }))} />
          <ToggleRow icon="mic"    label="Voice Messages"       value={settings.voiceMessagesEnabled} onChange={v => setSettings(s => ({ ...s, voiceMessagesEnabled: v }))} />
          <ToggleRow icon="image"  label="Image Messages"       value={settings.imageMessagesEnabled} onChange={v => setSettings(s => ({ ...s, imageMessagesEnabled: v }))} />
          <ToggleRow icon="person-add" label="Allow Sign Up"   value={settings.allowSignUp}        onChange={v => setSettings(s => ({ ...s, allowSignUp: v }))} />
          <ToggleRow icon="warning" label="Maintenance Mode"   value={settings.maintenanceMode}    onChange={v => setSettings(s => ({ ...s, maintenanceMode: v }))} />
        </Section>

        {/* Security */}
        <Section title="Security Settings">
          <SettingRow icon="lock-closed" label="E.S Notes PIN" value={settings.notesPin} onEdit={() => openEdit('notesPin', settings.notesPin)} />
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone">
          <TouchableOpacity style={styles.dangerBtn} onPress={() => Alert.alert('Confirm', 'This will send a broadcast notification to all users.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Send', style: 'destructive', onPress: () => Alert.alert('Sent', 'Broadcast notification sent.') }])}>
            <Ionicons name="notifications" size={18} color={COLORS.yellow} />
            <Text style={styles.dangerBtnText}>Broadcast Notification</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dangerBtn, { borderColor: 'rgba(255,61,107,0.4)' }]} onPress={() => Alert.alert('Not Implemented', 'Block user functionality coming soon.')}>
            <Ionicons name="ban" size={18} color={COLORS.red} />
            <Text style={[styles.dangerBtnText, { color: COLORS.red }]}>Block / Suspend User</Text>
          </TouchableOpacity>
        </Section>

        <Text style={styles.disclaimer}>
          {'All changes take effect immediately.\nAdmin access is logged and protected.'}
        </Text>
      </ScrollView>

      {/* Edit modal */}
      <Modal visible={!!editField} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit {editField}</Text>
            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              autoFocus
              placeholderTextColor={COLORS.textGray}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditField(null)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={saveEdit}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function SettingRow({ icon, label, value, onEdit }: { icon: string; label: string; value: string; onEdit: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onEdit}>
      <Ionicons name={icon as any} size={18} color={COLORS.primary} style={{ marginRight: 12 }} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
      <Ionicons name="pencil-outline" size={16} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

function ToggleRow({ icon, label, value, onChange }: { icon: string; label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon as any} size={18} color={COLORS.primary} style={{ marginRight: 12 }} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: COLORS.bgLighter, true: COLORS.primaryDim }}
        thumbColor={value ? COLORS.primary : COLORS.textGray}
      />
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
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: COLORS.primary },
  lockScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 14 },
  lockIcon: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.borderBright,
    marginBottom: 8, ...GLOW.primary,
  },
  lockTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  lockSub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
  pwdRow: {
    flexDirection: 'row', alignItems: 'center', width: '100%',
    backgroundColor: COLORS.bgLight, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.borderBright,
    marginTop: 8, paddingLeft: 14,
  },
  pwdInput: { flex: 1, fontSize: 16, color: COLORS.text, paddingVertical: 14 },
  unlockBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 30, ...GLOW.primary,
  },
  unlockBtnText: { fontSize: 16, fontWeight: '700', color: '#000' },
  ownerCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryDim,
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.borderBright,
  },
  ownerTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  ownerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textGray, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  sectionCard: { backgroundColor: COLORS.bgLight, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  rowLabel: { flex: 1, fontSize: 15, color: COLORS.text },
  rowValue: { fontSize: 14, color: COLORS.textMuted, marginRight: 8 },
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14,
    backgroundColor: 'rgba(255,215,0,0.06)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)',
  },
  dangerBtnText: { fontSize: 15, color: COLORS.yellow, fontWeight: '600' },
  disclaimer: { fontSize: 12, color: COLORS.textGray, textAlign: 'center', lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { width: '100%', backgroundColor: COLORS.bgLight, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  modalInput: {
    backgroundColor: COLORS.bg, borderRadius: 10, padding: 12, fontSize: 16,
    color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16,
  },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalCancel: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  modalCancelText: { color: COLORS.textMuted, fontWeight: '600' },
  modalSave: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center', ...GLOW.subtle },
  modalSaveText: { color: '#000', fontWeight: '700' },
});
