import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { mockStatus, StatusItem } from '@/services/mockData';

interface StatusScreenProps {
  onViewStatus: (status: StatusItem) => void;
}

export function StatusScreen({ onViewStatus }: StatusScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Updates</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="search" size={24} color={COLORS.textGray} /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="ellipsis-vertical" size={24} color={COLORS.textGray} /></TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.statusList} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.myStatus}>
          <View style={styles.myStatusAvatar}>
            <View style={styles.avatar}><Text style={styles.avatarText}>M</Text></View>
            <View style={styles.addIcon}><Ionicons name="add" size={14} color={COLORS.primary} /></View>
          </View>
          <View>
            <Text style={styles.chatName}>My Status</Text>
            <Text style={styles.lastMsg}>Tap to add status update</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Recent updates</Text>
        {mockStatus.filter(s => !s.seen).map(item => (
          <TouchableOpacity key={item.id} style={styles.statusItem} onPress={() => onViewStatus(item)}>
            <View style={styles.statusAvatar}><Text style={styles.avatarText}>{item.name.charAt(0)}</Text></View>
            <View>
              <Text style={styles.chatName}>{item.name}</Text>
              <Text style={styles.lastMsg}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Viewed updates</Text>
        {mockStatus.filter(s => s.seen).map(item => (
          <TouchableOpacity key={item.id} style={styles.statusItem} onPress={() => onViewStatus(item)}>
            <View style={[styles.statusAvatar, styles.seenAvatar]}><Text style={styles.avatarText}>{item.name.charAt(0)}</Text></View>
            <View>
              <Text style={styles.chatName}>{item.name}</Text>
              <Text style={styles.lastMsg}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.statusFabRow}>
        <TouchableOpacity style={styles.fabSmall}><Ionicons name="pencil" size={22} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.fab}><Ionicons name="camera" size={26} color="#fff" /></TouchableOpacity>
      </View>
    </View>
  );
}

export function StatusViewer({ status, onClose }: { status: StatusItem; onClose: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { onClose(); return 0; }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.statusViewer}>
      <View style={styles.statusProgressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
      </View>
      <View style={styles.statusViewerHeader}>
        <TouchableOpacity onPress={onClose}><Ionicons name="close" size={28} color="#fff" /></TouchableOpacity>
        <View style={styles.statusViewerInfo}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{status.name.charAt(0)}</Text></View>
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.statusViewerName}>{status.name}</Text>
            <Text style={styles.statusViewerTime}>{status.time}</Text>
          </View>
        </View>
      </View>
      <View style={styles.statusContent}>
        {status.type === 'text' ? (
          <View style={[styles.textStatus, { backgroundColor: status.bgColor ?? COLORS.primary }]}>
            <Text style={styles.statusText}>{status.text}</Text>
          </View>
        ) : (
          <Image source={{ uri: status.imageUrl }} style={styles.statusImage} contentFit="cover" transition={200} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.bgLight },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  headerIcons: { flexDirection: 'row' },
  iconBtn: { marginLeft: 18, padding: 4 },
  statusList: { flex: 1 },
  myStatus: { flexDirection: 'row', padding: 14, alignItems: 'center' },
  myStatusAvatar: { position: 'relative', marginRight: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.bgLighter, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: COLORS.text, fontSize: 20, fontWeight: 'bold' },
  addIcon: { position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.bg },
  chatName: { fontSize: 16, color: COLORS.text, fontWeight: '500' },
  lastMsg: { fontSize: 14, color: COLORS.textGray },
  sectionTitle: { color: COLORS.textGray, fontSize: 14, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: COLORS.bgLight },
  statusItem: { flexDirection: 'row', padding: 14, alignItems: 'center' },
  statusAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.bgLighter, justifyContent: 'center', alignItems: 'center', marginRight: 14, borderWidth: 2, borderColor: COLORS.primary },
  seenAvatar: { borderColor: COLORS.bgLighter },
  statusFabRow: { position: 'absolute', bottom: 16, right: 20, flexDirection: 'row', alignItems: 'center' },
  fabSmall: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.bgLighter, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  fab: { width: 58, height: 58, borderRadius: 29, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  statusViewer: { flex: 1, backgroundColor: '#000' },
  statusProgressBar: { height: 3, backgroundColor: 'rgba(255,255,255,0.3)', margin: 8, borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 2 },
  statusViewerHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingTop: 40 },
  statusViewerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginHorizontal: 12 },
  statusViewerName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  statusViewerTime: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  statusContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  textStatus: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', padding: 40 },
  statusText: { color: '#fff', fontSize: 24, textAlign: 'center' },
  statusImage: { width: '100%', height: '100%' },
});
