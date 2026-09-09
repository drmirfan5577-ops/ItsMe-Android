import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface BottomNavProps {
  current: string;
  onChange: (tab: string) => void;
  totalUnread?: number;
}

const tabs = [
  { id: 'chats',       icon: 'chatbubbles',  label: 'Chats'       },
  { id: 'status',      icon: 'radio',        label: 'Updates'     },
  { id: 'communities', icon: 'people',       label: 'Communities' },
  { id: 'ihub',        icon: 'book',         label: 'I-Hub'       },
  { id: 'eshub',       icon: 'globe',        label: 'E.S Hub'     },
  { id: 'settings',   icon: 'settings',     label: 'Settings'    },
];

export const BottomNav = React.memo(({ current, onChange, totalUnread = 0 }: BottomNavProps) => (
  <View style={styles.bottomNav}>
    {tabs.map(tab => {
      const isActive = current === tab.id;
      const showBadge = tab.id === 'chats' && totalUnread > 0;
      return (
        <TouchableOpacity
          key={tab.id}
          style={styles.navBtn}
          onPress={() => onChange(tab.id)}
          accessibilityLabel={tab.label}
          hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
        >
          {isActive ? <View style={styles.activeIndicator} /> : null}
          <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={isActive ? COLORS.primary : COLORS.textGray}
            />
            {showBadge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalUnread > 99 ? '99+' : totalUnread}</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.navLabel, isActive && styles.navLabelActive]} numberOfLines={1}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
));

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgLight,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 4,
    paddingBottom: 6,
  },
  navBtn: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  activeIndicator: {
    position: 'absolute', top: 0, width: 24, height: 2,
    backgroundColor: COLORS.primary, borderRadius: 1,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 6, elevation: 6,
  },
  iconWrap: { position: 'relative', padding: 2, borderRadius: 10 },
  iconWrapActive: {
    backgroundColor: COLORS.primaryDim,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 8, elevation: 8,
  },
  badge: {
    position: 'absolute', top: -4, right: -10,
    backgroundColor: COLORS.red, borderRadius: 8,
    minWidth: 16, height: 16, justifyContent: 'center',
    alignItems: 'center', paddingHorizontal: 4,
    shadowColor: COLORS.red, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 4, elevation: 4,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  navLabel: { fontSize: 9, marginTop: 2, color: COLORS.textGray, fontWeight: '500' },
  navLabelActive: { color: COLORS.primary, fontWeight: '700' },
});
