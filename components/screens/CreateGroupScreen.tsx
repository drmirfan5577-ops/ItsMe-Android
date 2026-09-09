import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GLOW } from '@/constants/theme';
import { useAuth } from '@/template';
import { searchUsers, createGroupConversation, DBProfile } from '@/services/database';

interface CreateGroupScreenProps {
  onBack: () => void;
  onGroupCreated: (convId: string) => void;
}

export function CreateGroupScreen({ onBack, onGroupCreated }: CreateGroupScreenProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'select' | 'name'>('select');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DBProfile[]>([]);
  const [selected, setSelected] = useState<DBProfile[]>([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (text.trim().length < 1) { setResults([]); return; }
    setLoading(true);
    const data = await searchUsers(text.trim(), user?.id ?? '');
    setResults(data);
    setLoading(false);
  }, [user?.id]);

  const toggleSelect = (profile: DBProfile) => {
    setSelected(prev =>
      prev.find(p => p.id === profile.id)
        ? prev.filter(p => p.id !== profile.id)
        : [...prev, profile]
    );
  };

  const isSelected = (id: string) => selected.some(p => p.id === id);

  const handleCreate = async () => {
    if (!groupName.trim()) { Alert.alert('Error', 'Please enter a group name'); return; }
    if (selected.length < 1) { Alert.alert('Error', 'Select at least 1 member'); return; }
    if (!user?.id) return;
    setCreating(true);
    const convId = await createGroupConversation(
      user.id,
      selected.map(p => p.id),
      groupName.trim()
    );
    setCreating(false);
    if (convId) onGroupCreated(convId);
    else Alert.alert('Error', 'Failed to create group');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{step === 'select' ? 'New Group' : 'Group Name'}</Text>
          <Text style={styles.headerSub}>
            {step === 'select' ? `${selected.length} selected` : `${selected.length} participants`}
          </Text>
        </View>
        {step === 'select' && selected.length > 0 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={() => setStep('name')}>
            <Ionicons name="arrow-forward" size={22} color="#000" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Selected chips */}
      {selected.length > 0 ? (
        <View style={styles.selectedRow}>
          <FlatList
            data={selected}
            horizontal
            keyExtractor={p => p.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.chip} onPress={() => toggleSelect(item)}>
                <Text style={styles.chipText}>{item.username ?? item.email}</Text>
                <Ionicons name="close" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          />
        </View>
      ) : null}

      {step === 'select' ? (
        <>
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={16} color={COLORS.textMuted} style={{ marginLeft: 12 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search members..."
                placeholderTextColor={COLORS.textGray}
                value={query}
                onChangeText={handleSearch}
                autoCapitalize="none"
              />
            </View>
          </View>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={results}
              keyExtractor={p => p.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8 }}
              ListEmptyComponent={
                query.length > 0 ? (
                  <Text style={styles.emptyText}>No users found</Text>
                ) : (
                  <View style={styles.hint}>
                    <Ionicons name="people" size={42} color={COLORS.textGray} />
                    <Text style={styles.hintText}>Search to add group members</Text>
                  </View>
                )
              }
              renderItem={({ item }) => {
                const sel = isSelected(item.id);
                return (
                  <TouchableOpacity style={styles.userItem} onPress={() => toggleSelect(item)}>
                    <View style={[styles.avatar, sel && styles.avatarSel]}>
                      {sel ? (
                        <Ionicons name="checkmark" size={22} color="#000" />
                      ) : (
                        <Text style={styles.avatarText}>{(item.username ?? item.email).charAt(0).toUpperCase()}</Text>
                      )}
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{item.username ?? item.email}</Text>
                      <Text style={styles.userEmail}>{item.email}</Text>
                    </View>
                    <View style={[styles.checkBox, sel && styles.checkBoxSel]}>
                      {sel ? <Ionicons name="checkmark" size={14} color="#000" /> : null}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </>
      ) : (
        <View style={styles.nameStep}>
          <View style={styles.groupIconPreview}>
            <Text style={styles.groupIconText}>👥</Text>
          </View>
          <View style={styles.nameInputWrap}>
            <TextInput
              style={styles.nameInput}
              placeholder="Group name"
              placeholderTextColor={COLORS.textGray}
              value={groupName}
              onChangeText={setGroupName}
              autoFocus
              maxLength={50}
            />
          </View>
          <Text style={styles.membersLabel}>
            {selected.map(p => p.username ?? p.email).join(', ')}
          </Text>
          <TouchableOpacity
            style={[styles.createBtn, !groupName.trim() && styles.createBtnDisabled]}
            onPress={handleCreate}
            disabled={creating || !groupName.trim()}
          >
            {creating ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Ionicons name="people" size={20} color="#000" />
                <Text style={styles.createBtnText}>Create Group</Text>
              </>
            )}
          </TouchableOpacity>
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
  headerSub: { fontSize: 12, color: COLORS.primary, marginTop: 1 },
  nextBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', ...GLOW.primary,
  },
  selectedRow: {
    borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.bgLight,
  },
  chip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryDim,
    borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5, gap: 5,
    borderWidth: 1, borderColor: COLORS.borderBright,
  },
  chipText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  searchRow: { padding: 12 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgLight,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, minHeight: 44,
  },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 15, paddingHorizontal: 10, paddingVertical: 12 },
  emptyText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 20, fontSize: 15 },
  hint: { alignItems: 'center', paddingTop: 60, gap: 12 },
  hintText: { color: COLORS.textMuted, fontSize: 15 },
  userItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
    borderWidth: 1.5, borderColor: COLORS.borderBright,
  },
  avatarSel: { backgroundColor: COLORS.primary },
  avatarText: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  userEmail: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  checkBox: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  checkBoxSel: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  nameStep: { flex: 1, alignItems: 'center', padding: 24, paddingTop: 40, gap: 20 },
  groupIconPreview: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.borderBright, ...GLOW.primary,
  },
  groupIconText: { fontSize: 44 },
  nameInputWrap: {
    width: '100%', backgroundColor: COLORS.bgLight, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.borderBright,
  },
  nameInput: {
    color: COLORS.text, fontSize: 18, fontWeight: '600', padding: 16,
    textAlign: 'center',
  },
  membersLabel: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.primary,
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 30, marginTop: 8,
    ...GLOW.primary,
  },
  createBtnDisabled: { opacity: 0.4 },
  createBtnText: { fontSize: 16, fontWeight: '700', color: '#000' },
});
