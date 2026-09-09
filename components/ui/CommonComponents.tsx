import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GLOW } from '@/constants/theme';

export const MenuItem = React.memo(({ icon, title, onPress }: { icon: string; title: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon as any} size={20} color={COLORS.primary} />
    <Text style={styles.menuItemText}>{title}</Text>
  </TouchableOpacity>
));

export const FilterChip = React.memo(({ label, active, onPress, badge }: { label: string; active: boolean; onPress: () => void; badge?: number }) => (
  <TouchableOpacity style={[styles.filterChip, active && styles.filterChipActive]} onPress={onPress}>
    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
      {label}{badge ? ` (${badge})` : ''}
    </Text>
  </TouchableOpacity>
));

export const ProfileItem = React.memo(({ icon, title, subtitle, onPress }: { icon: string; title: string; subtitle?: string; onPress?: () => void }) => (
  <TouchableOpacity style={styles.profileItem} onPress={onPress}>
    <View style={styles.profileIconWrap}>
      <Ionicons name={icon as any} size={20} color={COLORS.primary} />
    </View>
    <View style={styles.profileItemText}>
      <Text style={styles.profileItemTitle}>{title}</Text>
      {subtitle ? <Text style={styles.profileItemSubtitle}>{subtitle}</Text> : null}
    </View>
    <Ionicons name="chevron-forward" size={16} color={COLORS.textGray} />
  </TouchableOpacity>
));

export const ActionButton = React.memo(({ icon, title, onPress, danger }: { icon: string; title: string; onPress: () => void; danger?: boolean }) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
    <Ionicons name={icon as any} size={22} color={danger ? COLORS.red : COLORS.primary} />
    <Text style={[styles.actionText, danger ? { color: COLORS.red } : null]}>{title}</Text>
  </TouchableOpacity>
));

export const AttachOption = React.memo(({ icon, color, title, onPress }: { icon: string; color: string; title: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.attachOption} onPress={onPress}>
    <View style={[styles.attachIcon, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <Ionicons name={icon as any} size={22} color={color} />
    </View>
    <Text style={styles.attachText}>{title}</Text>
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 13,
    paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  menuItemText: { color: COLORS.text, fontSize: 15, marginLeft: 14, fontWeight: '500' },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: COLORS.bgLighter, borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primaryDim, borderColor: COLORS.borderBright,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 6, elevation: 4,
  },
  filterChipText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: COLORS.primary },
  profileItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  profileIconWrap: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
    borderWidth: 1, borderColor: COLORS.borderBright,
  },
  profileItemText: { flex: 1 },
  profileItemTitle: { fontSize: 16, color: COLORS.text, fontWeight: '500' },
  profileItemSubtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  actionBtn: { alignItems: 'center', padding: 10, gap: 5 },
  actionText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
  attachOption: { alignItems: 'center', width: 70, marginVertical: 8 },
  attachIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 6, borderWidth: 1 },
  attachText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '500' },
});
