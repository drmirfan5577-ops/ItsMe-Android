import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList, StyleSheet,
  TextInput, Linking, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GLOW } from '@/constants/theme';
import { useAuth } from '@/template';
import { getSupabaseClient } from '@/template';

type ESTab = 'news' | 'notes';

const NEWS_FEEDS = [
  { id: '1', name: 'Dawn News',       url: 'https://www.dawn.com',             icon: '📰', color: '#3b82f6' },
  { id: '2', name: 'ARY News',        url: 'https://arynews.tv',               icon: '📺', color: '#ef4444' },
  { id: '3', name: 'Geo News',        url: 'https://www.geo.tv',               icon: '🌍', color: '#22c55e' },
  { id: '4', name: 'The News Int.',   url: 'https://www.thenews.com.pk',       icon: '📡', color: '#f59e0b' },
  { id: '5', name: 'Express Tribune', url: 'https://tribune.com.pk',           icon: '✍️', color: '#8b5cf6' },
];

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const NOTES_PIN = '1234'; // default pin — changeable in admin panel

export function ESHubScreen() {
  const [tab, setTab] = useState<ESTab>('news');
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌐 E.S Hub</Text>
        <Text style={styles.headerSub}>News & Secure Notes</Text>
      </View>
      <View style={styles.tabRow}>
        {([
          { id: 'news', label: '📰 E.S News' },
          { id: 'notes', label: '🔐 E.S Notes' },
        ] as { id: ESTab; label: string }[]).map(t => (
          <TouchableOpacity
            key={t.id}
            style={[styles.tabBtn, tab === t.id && styles.tabBtnActive]}
            onPress={() => setTab(t.id)}
          >
            <Text style={[styles.tabLabel, tab === t.id && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {tab === 'news'  ? <NewsTab />  : <NotesTab />}
    </View>
  );
}

// ── News Tab ─────────────────────────────────────────────
function NewsTab() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View style={styles.newsNote}>
        <Ionicons name="information-circle-outline" size={16} color={COLORS.blue} />
        <Text style={styles.newsNoteText}>Tap any channel to open its website in your browser.</Text>
      </View>
      {NEWS_FEEDS.map(feed => (
        <TouchableOpacity
          key={feed.id}
          style={styles.newsCard}
          onPress={() => Linking.openURL(feed.url).catch(() => Alert.alert('Error', 'Could not open URL'))}
        >
          <View style={[styles.newsIconBox, { backgroundColor: feed.color + '22', borderColor: feed.color + '55' }]}>
            <Text style={styles.newsIcon}>{feed.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.newsName}>{feed.name}</Text>
            <Text style={styles.newsUrl}>{feed.url.replace('https://', '')}</Text>
          </View>
          <Ionicons name="open-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ── Notes Tab ─────────────────────────────────────────────
function NotesTab() {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const loadNotes = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const db = getSupabaseClient();
    const { data } = await db
      .from('es_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    setNotes(data ?? []);
    setLoading(false);
  }, [user?.id]);

  const saveNote = async () => {
    if (!user?.id || !title.trim()) return;
    setSaving(true);
    const db = getSupabaseClient();
    if (editNote) {
      await db.from('es_notes').update({ title: title.trim(), content, updated_at: new Date().toISOString() }).eq('id', editNote.id);
    } else {
      await db.from('es_notes').insert({ user_id: user.id, title: title.trim(), content });
    }
    setSaving(false);
    setShowEditor(false);
    setEditNote(null);
    setTitle(''); setContent('');
    loadNotes();
  };

  const deleteNote = (id: string) => {
    Alert.alert('Delete Note', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const db = getSupabaseClient();
        await db.from('es_notes').delete().eq('id', id);
        loadNotes();
      }},
    ]);
  };

  const openEdit = (note: Note) => {
    setEditNote(note);
    setTitle(note.title);
    setContent(note.content);
    setShowEditor(true);
  };

  if (!unlocked) {
    return (
      <View style={styles.lockScreen}>
        <View style={styles.lockIcon}>
          <Ionicons name="lock-closed" size={42} color={COLORS.primary} />
        </View>
        <Text style={styles.lockTitle}>Secure Notes</Text>
        <Text style={styles.lockSub}>Enter your PIN to access</Text>
        <View style={styles.pinRow}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={[styles.pinDot, pin.length > i && styles.pinDotFilled]} />
          ))}
        </View>
        <View style={styles.numPad}>
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.numKey, !k && styles.numKeyEmpty]}
              disabled={!k}
              onPress={() => {
                if (k === '⌫') { setPin(p => p.slice(0, -1)); return; }
                const next = pin + k;
                setPin(next);
                if (next.length === 4) {
                  if (next === NOTES_PIN) { setUnlocked(true); setPin(''); loadNotes(); }
                  else { Alert.alert('Wrong PIN', 'Try again'); setPin(''); }
                }
              }}
            >
              <Text style={styles.numKeyText}>{k}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.notesToolbar}>
        <Text style={styles.notesCount}>{notes.length} note{notes.length !== 1 ? 's' : ''}</Text>
        <TouchableOpacity onPress={() => { setEditNote(null); setTitle(''); setContent(''); setShowEditor(true); }} style={styles.addNoteBtn}>
          <Ionicons name="add" size={22} color="#000" />
          <Text style={styles.addNoteBtnText}>New Note</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : notes.length === 0 ? (
        <View style={styles.emptyNotes}>
          <Ionicons name="document-text-outline" size={48} color={COLORS.textGray} />
          <Text style={styles.emptyNotesText}>No notes yet</Text>
          <Text style={styles.emptyNotesSub}>Tap + to create your first secure note</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={n => n.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 12, gap: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.noteCard} onPress={() => openEdit(item)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.notePreview} numberOfLines={2}>{item.content}</Text>
                <Text style={styles.noteDate}>{new Date(item.updated_at).toLocaleDateString()}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteNote(item.id)} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="trash-outline" size={18} color={COLORS.red} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
      {/* Editor modal */}
      <Modal visible={showEditor} animationType="slide" transparent={false}>
        <View style={styles.editorScreen}>
          <View style={styles.editorHeader}>
            <TouchableOpacity onPress={() => { setShowEditor(false); setEditNote(null); }} style={{ padding: 8 }}>
              <Ionicons name="close" size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
            <Text style={styles.editorTitle}>{editNote ? 'Edit Note' : 'New Note'}</Text>
            <TouchableOpacity
              style={[styles.saveBtn, (!title.trim() || saving) && styles.saveBtnDis]}
              onPress={saveNote}
              disabled={!title.trim() || saving}
            >
              {saving ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.saveBtnText}>Save</Text>}
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.titleInput}
            placeholder="Title"
            placeholderTextColor={COLORS.textGray}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.contentInput}
            placeholder="Write your secure note here..."
            placeholderTextColor={COLORS.textGray}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
    backgroundColor: COLORS.bgLight, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 22, fontWeight: '800', color: COLORS.primary,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8,
  },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  tabRow: {
    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: COLORS.bgLight, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 10,
  },
  tabBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    backgroundColor: COLORS.bgLighter, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  tabBtnActive: { backgroundColor: COLORS.primaryDim, borderColor: COLORS.borderBright, ...GLOW.subtle },
  tabLabel: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },
  tabLabelActive: { color: COLORS.primary },
  newsNote: {
    flexDirection: 'row', gap: 8, backgroundColor: 'rgba(77,200,255,0.08)',
    padding: 12, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(77,200,255,0.2)', alignItems: 'center',
  },
  newsNoteText: { fontSize: 13, color: COLORS.blue, flex: 1 },
  newsCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgLight,
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 14,
  },
  newsIconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  newsIcon: { fontSize: 22 },
  newsName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  newsUrl: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  // Lock screen
  lockScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  lockIcon: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.borderBright,
    marginBottom: 8, ...GLOW.primary,
  },
  lockTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  lockSub: { fontSize: 14, color: COLORS.textMuted },
  pinRow: { flexDirection: 'row', gap: 16, marginVertical: 16 },
  pinDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: COLORS.borderBright },
  pinDotFilled: { backgroundColor: COLORS.primary, borderColor: COLORS.primary, ...GLOW.primary },
  numPad: { flexDirection: 'row', flexWrap: 'wrap', width: 240, gap: 12, justifyContent: 'center' },
  numKey: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: COLORS.bgLight,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  numKeyEmpty: { backgroundColor: 'transparent', borderWidth: 0 },
  numKeyText: { fontSize: 22, fontWeight: '600', color: COLORS.text },
  // Notes
  notesToolbar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  notesCount: { fontSize: 14, color: COLORS.textMuted },
  addNoteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, ...GLOW.primary,
  },
  addNoteBtnText: { fontSize: 14, fontWeight: '700', color: '#000' },
  emptyNotes: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyNotesText: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  emptyNotesSub: { fontSize: 14, color: COLORS.textMuted },
  noteCard: {
    flexDirection: 'row', backgroundColor: COLORS.bgLight,
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 10, alignItems: 'flex-start',
  },
  noteTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  notePreview: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, lineHeight: 18 },
  noteDate: { fontSize: 11, color: COLORS.textGray, marginTop: 6 },
  deleteBtn: { padding: 4 },
  // Editor modal
  editorScreen: { flex: 1, backgroundColor: COLORS.bg },
  editorHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    backgroundColor: COLORS.bgLight, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  editorTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  saveBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 18, paddingVertical: 8,
    borderRadius: 20, ...GLOW.subtle,
  },
  saveBtnDis: { opacity: 0.4 },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#000' },
  titleInput: {
    fontSize: 18, fontWeight: '700', color: COLORS.text, padding: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  contentInput: { flex: 1, fontSize: 15, color: COLORS.text, padding: 16, lineHeight: 24 },
});
