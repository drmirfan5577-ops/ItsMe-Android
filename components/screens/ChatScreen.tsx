import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, GLOW } from '@/constants/theme';
import { DBConversation, DBMessage, DBReaction } from '@/services/database';
import { useMessages } from '@/hooks/useMessages';
import { useTyping } from '@/hooks/useTyping';
import { useAuth } from '@/template';
import { ChatInfoScreen } from './ChatInfoScreen';

const QUICK_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🙏'];
const ALL_EMOJIS = ['😀','😂','❤️','👍','🎉','🔥','💯','🙏','😊','😍','🤔','😎','🥳','😢','😡','👏','✨','🌟','🫡','💪','🎯','💎'];

interface ChatScreenProps {
  conv: DBConversation;
  onBack: () => void;
  onCall: (type: string) => void;
}

export function ChatScreen({ conv, onBack, onCall }: ChatScreenProps) {
  const { user } = useAuth();
  const { messages, loading, sending, send, react } = useMessages(conv.id);
  const { typingUsers, setTyping } = useTyping(conv.id);

  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [replyTo, setReplyTo] = useState<DBMessage | null>(null);
  const [showReactTo, setShowReactTo] = useState<DBMessage | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const audioRecording = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const name = conv.type === 'direct'
    ? (conv.other_user?.username ?? conv.other_user?.email ?? 'Chat')
    : (conv.name ?? 'Group');

  // Others who are typing (excluding self)
  const otherTyping = typingUsers.filter(id => id !== user?.id);

  const handleInputChange = (text: string) => {
    setInput(text);
    setTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setTyping(false), 2000);
  };

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    setReplyTo(null);
    setTyping(false);
    await send({ content: text, type: 'text', replied_to_id: replyTo?.id ?? null });
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [input, replyTo, send, setTyping]);

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) { Alert.alert('Permission Required', 'Please allow access to your photos'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8,
    });
    if (!result.canceled) {
      setShowAttach(false);
      await send({ content: 'Photo', type: 'image', imageUri: result.assets[0].uri });
    }
  };

  const takePhoto = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) { Alert.alert('Permission Required', 'Please allow camera access'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
    if (!result.canceled) {
      setShowAttach(false);
      await send({ content: 'Photo', type: 'image', imageUri: result.assets[0].uri });
    }
  };

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) { Alert.alert('Permission Required', 'Please allow microphone access'); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      audioRecording.current = rec;
      setRecording(true);
      setRecordingTime(0);
      recordTimer.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch { Alert.alert('Error', 'Could not start recording'); }
  };

  const stopRecording = async () => {
    if (!audioRecording.current) return;
    if (recordTimer.current) clearInterval(recordTimer.current);
    setRecording(false);
    await audioRecording.current.stopAndUnloadAsync();
    const uri = audioRecording.current.getURI();
    const dur = recordingTime;
    audioRecording.current = null;
    setRecordingTime(0);
    if (uri) await send({ content: 'Voice message', type: 'voice', audioUri: uri, duration_seconds: dur });
  };

  const cancelRecording = async () => {
    if (!audioRecording.current) return;
    if (recordTimer.current) clearInterval(recordTimer.current);
    setRecording(false);
    await audioRecording.current.stopAndUnloadAsync();
    audioRecording.current = null;
    setRecordingTime(0);
  };

  const playVoice = async (msgId: string, url: string) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        if (playingVoice === msgId) { setPlayingVoice(null); return; }
      }
      setPlayingVoice(msgId);
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      soundRef.current = sound;
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingVoice(null);
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
    } catch {
      setPlayingVoice(null);
      Alert.alert('Error', 'Could not play audio');
    }
  };

  useEffect(() => {
    return () => {
      if (recordTimer.current) clearInterval(recordTimer.current);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      soundRef.current?.unloadAsync();
    };
  }, []);

  const handleReact = async (msg: DBMessage, emoji: string) => {
    setShowReactTo(null);
    await react(msg.id, emoji);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (showInfo) return <ChatInfoScreen conv={conv} onBack={() => setShowInfo(false)} />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerInfo} onPress={() => setShowInfo(true)}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerName} numberOfLines={1}>{name}</Text>
            {otherTyping.length > 0 ? (
              <Text style={styles.typingStatus}>typing...</Text>
            ) : (
              <Text style={styles.headerStatus}>
                {conv.type === 'group' ? `${conv.members?.length ?? 0} members` : 'tap for info'}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => onCall('video')}>
            <Ionicons name="videocam" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => onCall('voice')}>
            <Ionicons name="call" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages area */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {/* Encryption note */}
        <View style={styles.encNote}>
          <Ionicons name="lock-closed" size={11} color={COLORS.yellow} />
          <Text style={styles.encText}> End-to-end encrypted · Your messages are private</Text>
        </View>

        {loading && messages.length === 0 ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : null}

        {messages.map(msg => {
          const isMine = msg.sender_id === user?.id;
          const reactionGroups: Record<string, number> = {};
          (msg.reactions ?? []).forEach((r: DBReaction) => {
            reactionGroups[r.emoji] = (reactionGroups[r.emoji] ?? 0) + 1;
          });

          return (
            <View key={msg.id} style={isMine ? styles.rowRight : styles.rowLeft}>
              {showReactTo?.id === msg.id ? (
                <View style={[styles.reactPicker, isMine ? styles.reactPickerRight : styles.reactPickerLeft]}>
                  {QUICK_EMOJIS.map(em => (
                    <TouchableOpacity key={em} onPress={() => handleReact(msg, em)} style={styles.reactEmoji}>
                      <Text style={styles.reactEmojiText}>{em}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity onPress={() => setShowReactTo(null)} style={styles.reactEmoji}>
                    <Ionicons name="close" size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              ) : null}

              <Pressable
                onLongPress={() => setShowReactTo(msg)}
                onPress={() => { if (showReactTo?.id === msg.id) setShowReactTo(null); }}
                delayLongPress={350}
                style={[styles.bubble, isMine ? styles.bubbleSent : styles.bubbleReceived]}
              >
                {conv.type === 'group' && !isMine ? (
                  <Text style={styles.senderLabel}>{msg.sender?.username ?? msg.sender?.email ?? 'User'}</Text>
                ) : null}

                {msg.replied_to_id ? (
                  <View style={styles.replyBubble}>
                    <View style={styles.replyLine} />
                    <Text style={styles.replyText} numberOfLines={2}>
                      {messages.find(m => m.id === msg.replied_to_id)?.content ?? '↩ Quoted message'}
                    </Text>
                  </View>
                ) : null}

                {msg.type === 'image' && msg.image_url ? (
                  <Image source={{ uri: msg.image_url }} style={styles.msgImage} contentFit="cover" transition={200} />
                ) : msg.type === 'voice' ? (
                  <TouchableOpacity
                    style={styles.voiceRow}
                    onPress={() => msg.audio_url ? playVoice(msg.id, msg.audio_url) : null}
                  >
                    <View style={[styles.voicePlayBtn, playingVoice === msg.id && styles.voicePlayBtnActive]}>
                      <Ionicons
                        name={playingVoice === msg.id ? 'pause' : 'play'}
                        size={20}
                        color={playingVoice === msg.id ? '#000' : COLORS.primary}
                      />
                    </View>
                    <View style={styles.waveform}>
                      {Array.from({ length: 26 }).map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.waveBar,
                            { height: [7,12,18,10,14,22,8,16,20,10,8,18,14,22,10,16,8,12,20,14,8,18,10,16,8,12][i] ?? 10 },
                            playingVoice === msg.id && { backgroundColor: COLORS.primaryGlow },
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={styles.voiceDur}>{formatTime(msg.duration_seconds ?? 0)}</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.msgText}>{msg.content}</Text>
                )}

                <View style={styles.msgMeta}>
                  <Text style={styles.msgTime}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  {isMine ? (
                    <Ionicons name="checkmark-done" size={13} color={COLORS.blue} style={{ marginLeft: 3 }} />
                  ) : null}
                </View>
              </Pressable>

              {/* Reply shortcut on swipe / long press */}
              {showReactTo?.id !== msg.id ? (
                <TouchableOpacity
                  style={[styles.replyShortcut, isMine ? { right: -30 } : { left: -30 }]}
                  onPress={() => { setReplyTo(msg); setShowReactTo(null); }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="return-up-back" size={16} color={COLORS.textGray} />
                </TouchableOpacity>
              ) : null}

              {Object.keys(reactionGroups).length > 0 ? (
                <View style={[styles.reactionsRow, isMine ? styles.reactionsRight : styles.reactionsLeft]}>
                  {Object.entries(reactionGroups).map(([em, count]) => (
                    <TouchableOpacity
                      key={em}
                      style={styles.reactionChip}
                      onPress={() => handleReact(msg, em)}
                    >
                      <Text style={styles.reactionChipText}>{em}{count > 1 ? ` ${count}` : ''}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}

        {/* Typing indicator */}
        {otherTyping.length > 0 ? (
          <View style={styles.typingRow}>
            <View style={styles.typingBubble}>
              <View style={styles.typingDots}>
                <View style={[styles.typingDot, styles.dot1]} />
                <View style={[styles.typingDot, styles.dot2]} />
                <View style={[styles.typingDot, styles.dot3]} />
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Reply bar */}
      {replyTo ? (
        <View style={styles.replyBar}>
          <View style={styles.replyBarLine} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.replyBarTitle}>↩ Replying</Text>
            <Text style={styles.replyBarText} numberOfLines={1}>{replyTo.content}</Text>
          </View>
          <TouchableOpacity onPress={() => setReplyTo(null)} style={{ padding: 8 }}>
            <Ionicons name="close" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Emoji picker */}
      {showEmoji ? (
        <View style={styles.emojiPicker}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
            {ALL_EMOJIS.map((em, i) => (
              <TouchableOpacity key={i} style={styles.emojiBtn} onPress={() => setInput(p => p + em)}>
                <Text style={styles.emojiTxt}>{em}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Attach menu */}
      {showAttach ? (
        <View style={styles.attachMenu}>
          {[
            { icon: 'image-outline', color: '#a855f7', label: 'Gallery', action: pickImage },
            { icon: 'camera-outline', color: '#ef4444', label: 'Camera', action: takePhoto },
            { icon: 'document-outline', color: '#3b82f6', label: 'Document', action: () => { setShowAttach(false); Alert.alert('Coming soon'); } },
            { icon: 'location-outline', color: '#f97316', label: 'Location', action: () => { setShowAttach(false); Alert.alert('Coming soon'); } },
            { icon: 'person-outline', color: '#22c55e', label: 'Contact', action: () => { setShowAttach(false); Alert.alert('Coming soon'); } },
            { icon: 'stats-chart-outline', color: '#eab308', label: 'Poll', action: () => { setShowAttach(false); Alert.alert('Coming soon'); } },
          ].map(opt => (
            <TouchableOpacity key={opt.label} style={styles.attachOpt} onPress={opt.action}>
              <View style={[styles.attachIconCircle, { backgroundColor: opt.color + '22', borderColor: opt.color + '55' }]}>
                <Ionicons name={opt.icon as any} size={22} color={opt.color} />
              </View>
              <Text style={styles.attachLabel}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {/* Recording bar */}
      {recording ? (
        <View style={styles.recordingBar}>
          <TouchableOpacity onPress={cancelRecording} style={styles.cancelRec}>
            <Ionicons name="trash-outline" size={22} color={COLORS.red} />
          </TouchableOpacity>
          <View style={styles.recordingInfo}>
            <View style={styles.recDot} />
            <Text style={styles.recTime}>{formatTime(recordingTime)}</Text>
          </View>
          <Text style={styles.recHint}>Release to send · Tap 🗑 to cancel</Text>
        </View>
      ) : null}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <View style={styles.inputBox}>
          <TouchableOpacity
            style={styles.inputIcon}
            onPress={() => { setShowEmoji(!showEmoji); setShowAttach(false); }}
          >
            <Ionicons name={showEmoji ? 'keyboard' : 'happy-outline'} size={24} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Message"
            placeholderTextColor={COLORS.textGray}
            value={input}
            onChangeText={handleInputChange}
            multiline
          />
          <TouchableOpacity
            style={styles.inputIcon}
            onPress={() => { setShowAttach(!showAttach); setShowEmoji(false); }}
          >
            <Ionicons name="attach" size={24} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, recording && styles.sendBtnRec]}
          onPress={() => {
            if (input.trim()) handleSend();
            else if (recording) stopRecording();
            else startRecording();
          }}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Ionicons
              name={input.trim() ? 'send' : recording ? 'stop-circle' : 'mic'}
              size={22}
              color={recording ? COLORS.red : '#000'}
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgLight,
    paddingHorizontal: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 8, marginRight: 4 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  headerAvatar: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
    borderWidth: 1.5, borderColor: COLORS.borderBright,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 6,
  },
  headerAvatarText: { fontSize: 17, fontWeight: '700', color: COLORS.primary },
  headerName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  headerStatus: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  typingStatus: { fontSize: 11, color: COLORS.primary, marginTop: 1, fontStyle: 'italic' },
  headerActions: { flexDirection: 'row' },
  iconBtn: { marginLeft: 14, padding: 4 },
  messages: { flex: 1 },
  messagesContent: { padding: 12, paddingBottom: 16 },
  encNote: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,215,0,0.07)', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, alignSelf: 'center', marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.18)',
  },
  encText: { fontSize: 11, color: COLORS.yellow },
  rowLeft: { alignItems: 'flex-start', marginBottom: 10, position: 'relative' },
  rowRight: { alignItems: 'flex-end', marginBottom: 10, position: 'relative' },
  bubble: {
    maxWidth: '80%', borderRadius: 16, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6,
  },
  bubbleSent: {
    backgroundColor: COLORS.bubble, borderBottomRightRadius: 4,
    borderWidth: 1, borderColor: 'rgba(0,229,160,0.18)',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 3,
  },
  bubbleReceived: {
    backgroundColor: COLORS.bubbleOther, borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  senderLabel: { fontSize: 12, color: COLORS.primary, fontWeight: '700', marginBottom: 3 },
  replyBubble: {
    flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8, padding: 6, marginBottom: 6, gap: 6,
  },
  replyLine: { width: 3, borderRadius: 2, backgroundColor: COLORS.primary },
  replyText: { fontSize: 12, color: COLORS.textMuted, flex: 1 },
  msgImage: { width: 220, height: 190, borderRadius: 12, marginBottom: 4 },
  voiceRow: {
    flexDirection: 'row', alignItems: 'center', width: 230, gap: 8,
  },
  voicePlayBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.borderBright,
  },
  voicePlayBtnActive: { backgroundColor: COLORS.primary },
  waveform: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 2 },
  waveBar: { width: 2.5, backgroundColor: COLORS.primary, borderRadius: 2, opacity: 0.65 },
  voiceDur: { fontSize: 11, color: COLORS.textMuted, minWidth: 32 },
  msgText: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
  msgMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 3, gap: 2 },
  msgTime: { fontSize: 10, color: COLORS.textGray },
  reactPicker: {
    flexDirection: 'row', backgroundColor: COLORS.bgLighter, borderRadius: 30,
    paddingHorizontal: 8, paddingVertical: 6, marginBottom: 4,
    borderWidth: 1, borderColor: COLORS.border, gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.6, shadowRadius: 8, elevation: 10,
  },
  reactPickerLeft: { alignSelf: 'flex-start' },
  reactPickerRight: { alignSelf: 'flex-end' },
  reactEmoji: { padding: 4 },
  reactEmojiText: { fontSize: 24 },
  replyShortcut: {
    position: 'absolute', top: 14,
    width: 28, height: 28, justifyContent: 'center', alignItems: 'center',
  },
  reactionsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 3, gap: 4 },
  reactionsLeft: { alignSelf: 'flex-start', marginLeft: 4 },
  reactionsRight: { alignSelf: 'flex-end', marginRight: 4 },
  reactionChip: {
    backgroundColor: COLORS.bgLighter, borderRadius: 14, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: COLORS.border,
  },
  reactionChipText: { fontSize: 14 },
  // Typing indicator
  typingRow: { alignItems: 'flex-start', marginBottom: 8 },
  typingBubble: {
    backgroundColor: COLORS.bubbleOther, borderRadius: 16, borderBottomLeftRadius: 4,
    paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  typingDots: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, opacity: 0.7 },
  dot1: {},
  dot2: { opacity: 0.5, marginTop: -4 },
  dot3: { opacity: 0.3, marginTop: -8 },
  replyBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgLight,
    padding: 10, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  replyBarLine: { width: 3, height: '100%', minHeight: 28, borderRadius: 2, backgroundColor: COLORS.primary },
  replyBarTitle: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  replyBarText: { fontSize: 13, color: COLORS.textMuted, marginTop: 1 },
  emojiPicker: {
    backgroundColor: COLORS.bgLight, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  emojiBtn: { padding: 8 },
  emojiTxt: { fontSize: 26 },
  attachMenu: {
    flexDirection: 'row', flexWrap: 'wrap', backgroundColor: COLORS.bgLight,
    padding: 16, gap: 14, borderTopWidth: 1, borderTopColor: COLORS.border,
    justifyContent: 'center',
  },
  attachOpt: { alignItems: 'center', width: 72 },
  attachIconCircle: {
    width: 54, height: 54, borderRadius: 27, justifyContent: 'center',
    alignItems: 'center', marginBottom: 6, borderWidth: 1.5,
  },
  attachLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  recordingBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,61,107,0.08)',
    padding: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,61,107,0.3)', gap: 10,
  },
  cancelRec: { padding: 6 },
  recordingInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.red },
  recTime: { fontSize: 16, fontWeight: '700', color: COLORS.red },
  recHint: { flex: 1, fontSize: 11, color: COLORS.textMuted },
  inputBar: {
    flexDirection: 'row', padding: 8, paddingBottom: 10,
    backgroundColor: COLORS.bgLight, alignItems: 'flex-end',
    borderTopWidth: 1, borderTopColor: COLORS.border, gap: 8,
  },
  inputBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bg, borderRadius: 24, paddingHorizontal: 4,
    minHeight: 46, borderWidth: 1, borderColor: COLORS.border,
  },
  inputIcon: { padding: 10 },
  input: { flex: 1, color: COLORS.text, fontSize: 15, paddingVertical: 10, maxHeight: 100 },
  sendBtn: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', ...GLOW.primary,
  },
  sendBtnRec: { backgroundColor: 'rgba(255,61,107,0.15)', borderWidth: 1.5, borderColor: COLORS.red },
});
