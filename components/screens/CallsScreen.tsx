import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { mockCalls, CallItem } from '@/services/mockData';

interface CallsScreenProps {
  onCall: (call: CallItem) => void;
}

export function CallsScreen({ onCall }: CallsScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calls</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="search" size={24} color={COLORS.textGray} /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="ellipsis-vertical" size={24} color={COLORS.textGray} /></TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={mockCalls}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.callItem} onPress={() => onCall(item)}>
            <View style={[styles.avatar, item.group ? styles.groupAvatar : null]}>
              <Text style={styles.avatarText}>{item.group ? '👥' : item.name.charAt(0)}</Text>
            </View>
            <View style={styles.callInfo}>
              <Text style={[styles.callName, item.missed ? { color: COLORS.red } : null]}>{item.name}</Text>
              <View style={styles.callMeta}>
                <Ionicons name={item.type === 'incoming' ? 'arrow-down' : 'arrow-up'} size={14} color={item.missed ? COLORS.red : COLORS.green} />
                <Text style={styles.callMetaText}>{item.time}</Text>
                {item.duration ? <Text style={styles.callDuration}> · {item.duration}</Text> : null}
              </View>
            </View>
            <TouchableOpacity onPress={() => onCall(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={item.callType === 'video' ? 'videocam' : 'call'} size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

export function CallScreen({ call, onEnd }: { call: CallItem & { name: string; callType: string }; onEnd: () => void }) {
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected'>('connecting');

  useEffect(() => {
    const connectTimer = setTimeout(() => setCallStatus('connected'), 2000);
    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    if (callStatus !== 'connected') return;
    const interval = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <View style={styles.callScreen}>
      <View style={styles.callTopBar}>
        <Ionicons name="lock-closed" size={12} color="rgba(255,255,255,0.7)" />
        <Text style={styles.callEncryptedText}>  End-to-end encrypted</Text>
      </View>
      <View style={styles.callCenter}>
        <View style={styles.callAvatar}>
          <Text style={styles.callAvatarText}>{call.name.charAt(0)}</Text>
        </View>
        <Text style={styles.callName}>{call.name}</Text>
        <Text style={styles.callStatus}>{callStatus === 'connecting' ? 'Connecting...' : formatTime(duration)}</Text>
      </View>
      <View style={styles.callControls}>
        <CallButton icon={muted ? 'mic-off' : 'mic'} active={muted} onPress={() => setMuted(!muted)} />
        <CallButton icon={speaker ? 'volume-high' : 'volume-low'} active={speaker} onPress={() => setSpeaker(!speaker)} />
        <CallButton icon="person-add" onPress={() => Alert.alert('Add participant')} />
        <CallButton icon="call" danger onPress={onEnd} />
      </View>
    </View>
  );
}

function CallButton({ icon, onPress, active, danger }: { icon: string; onPress: () => void; active?: boolean; danger?: boolean }) {
  return (
    <TouchableOpacity style={[styles.callButton, active ? styles.callButtonActive : null, danger ? styles.callButtonDanger : null]} onPress={onPress}>
      <Ionicons name={icon as any} size={24} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.bgLight },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  headerIcons: { flexDirection: 'row' },
  iconBtn: { marginLeft: 18, padding: 4 },
  callItem: { flexDirection: 'row', padding: 14, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.bgLighter },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.bgLighter, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  groupAvatar: { backgroundColor: COLORS.primaryDark },
  avatarText: { color: COLORS.text, fontSize: 20, fontWeight: 'bold' },
  callInfo: { flex: 1 },
  callName: { fontSize: 16, color: COLORS.text, fontWeight: '500', marginBottom: 2 },
  callMeta: { flexDirection: 'row', alignItems: 'center' },
  callMetaText: { fontSize: 13, color: COLORS.textGray, marginLeft: 4 },
  callDuration: { fontSize: 13, color: COLORS.textGray },
  fab: { position: 'absolute', bottom: 16, right: 20, width: 58, height: 58, borderRadius: 29, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  callScreen: { flex: 1, backgroundColor: '#1a2e35', justifyContent: 'space-between', paddingBottom: 40 },
  callTopBar: { paddingTop: 60, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  callEncryptedText: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  callCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  callAvatar: { width: 130, height: 130, borderRadius: 65, backgroundColor: COLORS.bgLighter, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  callAvatarText: { color: COLORS.text, fontSize: 52, fontWeight: 'bold' },
  callStatus: { color: 'rgba(255,255,255,0.7)', fontSize: 16, marginTop: 8 },
  callControls: { flexDirection: 'row', justifyContent: 'space-evenly', paddingHorizontal: 24 },
  callButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  callButtonActive: { backgroundColor: 'rgba(255,255,255,0.4)' },
  callButtonDanger: { backgroundColor: COLORS.red },
});
