// ─── Islamic Hub Screen ──────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList,
  StyleSheet, ActivityIndicator, TextInput, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { COLORS, GLOW } from '@/constants/theme';

type IHubTab = 'quran' | 'ahadees' | 'azkaar' | 'prayers' | 'dajjal';

// Quran API: https://api.alquran.cloud/v1
const QURAN_API = 'https://api.alquran.cloud/v1';

const RECITATIONS = [
  { id: 'ar.alafasy',      label: 'Mishary Alafasy'    },
  { id: 'ar.abdurrahmaansudais', label: 'Sudais'       },
  { id: 'ar.husary',       label: 'Husary'             },
  { id: 'ar.minshawi',     label: 'Minshawy'           },
  { id: 'ur.ahmedali',     label: 'Urdu - Ahmed Ali'   },
];

const SURAH_NAMES: Record<number, string> = {
  1: 'Al-Fatiha', 2: 'Al-Baqarah', 3: 'Ali Imran', 4: 'An-Nisa', 5: 'Al-Maidah',
  6: 'Al-Anam', 7: 'Al-Araf', 18: 'Al-Kahf', 36: 'Ya-Sin', 55: 'Ar-Rahman',
  56: 'Al-Waqiah', 67: 'Al-Mulk', 112: 'Al-Ikhlas', 113: 'Al-Falaq', 114: 'An-Nas',
};

// Static offline content for sections not requiring API
const AZKAAR_DATA = [
  { id: '1', title: 'Morning Azkar', ar: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ', ur: 'ہم نے صبح کی اور صبح کی اللہ کی بادشاہت کے ساتھ', count: 1, ref: 'Abu Dawud 5071' },
  { id: '2', title: 'Evening Azkar', ar: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ', ur: 'ہم نے شام کی اور شام کی اللہ کی بادشاہت کے ساتھ', count: 1, ref: 'Abu Dawud 5071' },
  { id: '3', title: 'Before Sleep', ar: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', ur: 'اے اللہ! تیرے نام سے مرتا اور جیتا ہوں', count: 1, ref: 'Bukhari 6312' },
  { id: '4', title: 'After Prayer', ar: 'سُبْحَانَ اللَّهِ ٣٣ | الْحَمْدُ لِلَّهِ ٣٣ | اللَّهُ أَكْبَرُ ٣٤', ur: 'سبحان اللہ ۳۳ بار | الحمد للہ ۳۳ بار | اللہ اکبر ۳۴ بار', count: 33, ref: 'Muslim 597' },
  { id: '5', title: 'Ayat al-Kursi', ar: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', ur: 'اللہ — اس کے سوا کوئی معبود نہیں، وہ زندہ ہے، سب کا تھامنے والا', count: 1, ref: 'Al-Baqarah 2:255' },
  { id: '6', title: 'Durood Ibrahim', ar: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ', ur: 'اے اللہ! درود بھیج محمد ﷺ پر اور محمد ﷺ کی آل پر', count: 10, ref: 'Bukhari 3370' },
];

const PRAYERS_DATA = [
  { id: '1', title: 'Dua Before Eating', ar: 'بِسْمِ اللَّهِ', ur: 'اللہ کے نام سے', ref: 'Abu Dawud' },
  { id: '2', title: 'Dua After Eating', ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا', ur: 'تمام تعریفیں اس اللہ کیلئے ہیں جس نے ہمیں کھلایا', ref: 'Abu Dawud 3851' },
  { id: '3', title: 'Entering Home', ar: 'بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا', ur: 'اللہ کے نام پر داخل ہوئے اور اللہ کے نام پر نکلے', ref: 'Abu Dawud 5096' },
  { id: '4', title: 'Istikhara Dua', ar: 'اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ', ur: 'اے اللہ! میں تجھ سے تیرے علم کے واسطے سے خیر مانگتا ہوں', ref: 'Bukhari 6382' },
  { id: '5', title: 'Dua for Parents', ar: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', ur: 'اے رب! ان دونوں پر رحم فرما جیسا کہ انہوں نے مجھے بچپن میں پالا', ref: 'Al-Isra 17:24' },
  { id: '6', title: 'Dua for Anxiety', ar: 'لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ', ur: 'تیرے سوا کوئی معبود نہیں، پاک ہے تو، بے شک میں ظالموں میں سے تھا', ref: 'Al-Anbiya 21:87' },
];

const DAJJAL_DATA = [
  { id: '1', title: 'Protection from Dajjal', ar: 'أَعُوذُ بِاللَّهِ مِنَ الدَّجَّالِ', ur: 'میں اللہ کی پناہ مانگتا ہوں دجال سے', ref: 'Muslim 523' },
  { id: '2', title: 'First 10 Verses of Al-Kahf', ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ...', ur: 'سورۃ الکہف کی پہلی دس آیات دجال سے حفاظت کرتی ہیں', ref: 'Muslim 809' },
  { id: '3', title: 'Signs of Dajjal', ar: '', ur: 'دجال کانا ہوگا • پیشانی پر ک-ف-ر لکھا ہوگا • جنت و جہنم ساتھ ہوگی جو اصل میں جہنم و جنت ہے', ref: 'Bukhari 7130' },
  { id: '4', title: 'Madinah is Protected', ar: '', ur: 'دجال نہ مکہ میں داخل ہو سکے گا نہ مدینہ میں • فرشتے ان شہروں کی حفاظت کریں گے', ref: 'Bukhari 7135' },
  { id: '5', title: 'Dua from Tashahhud', ar: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ جَهَنَّمَ وَمِنْ عَذَابِ الْقَبْرِ وَمِنْ فِتْنَةِ الدَّجَّالِ', ur: 'اے اللہ! میں تیری پناہ مانگتا ہوں جہنم کے عذاب سے، قبر کے عذاب سے، مسیح دجال کے فتنے سے', ref: 'Muslim 590' },
];

const AHADEES_DATA = [
  { id: '1', text: '"Actions are judged by intentions."', ref: 'Bukhari 1, Muslim 1907', ur: 'اعمال کا دارومدار نیتوں پر ہے۔' },
  { id: '2', text: '"The best of you is the one who learns the Quran and teaches it."', ref: 'Bukhari 5027', ur: 'تم میں سب سے بہتر وہ ہے جو قرآن سیکھے اور سکھائے۔' },
  { id: '3', text: '"A Muslim is the one from whose tongue and hands Muslims are safe."', ref: 'Bukhari 10', ur: 'مسلمان وہ ہے جس کی زبان اور ہاتھ سے دوسرے مسلمان محفوظ رہیں۔' },
  { id: '4', text: '"None of you truly believes until he loves for his brother what he loves for himself."', ref: 'Bukhari 13', ur: 'تم میں سے کوئی اس وقت تک مؤمن نہیں جب تک اپنے بھائی کے لیے وہی نہ چاہے جو اپنے لیے چاہتا ہے۔' },
  { id: '5', text: '"The world is a prison for the believer and a paradise for the disbeliever."', ref: 'Muslim 2956', ur: 'دنیا مؤمن کے لیے قید خانہ اور کافر کے لیے جنت ہے۔' },
  { id: '6', text: '"Whoever follows a path in pursuit of knowledge, Allah will make easy for him a path to Paradise."', ref: 'Muslim 2699', ur: 'جو علم کی تلاش میں راستہ چلے، اللہ اس کے لیے جنت کا راستہ آسان کر دیتا ہے۔' },
];

export function IHubScreen() {
  const [tab, setTab] = useState<IHubTab>('quran');
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>☪ I-Hub</Text>
        <Text style={styles.headerSub}>Islamic Knowledge & Worship</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}
        contentContainerStyle={styles.tabRow}>
        {([
          { id: 'quran',   label: '📖 Quran'   },
          { id: 'ahadees', label: '📜 Ahadees'  },
          { id: 'azkaar',  label: '🌿 Azkaar'   },
          { id: 'prayers', label: '🤲 Prayers'  },
          { id: 'dajjal',  label: '⚠️ Fitna'    },
        ] as { id: IHubTab; label: string }[]).map(t => (
          <TouchableOpacity
            key={t.id}
            style={[styles.tabBtn, tab === t.id && styles.tabBtnActive]}
            onPress={() => setTab(t.id)}
          >
            <Text style={[styles.tabLabel, tab === t.id && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.content}>
        {tab === 'quran'   && <QuranTab />}
        {tab === 'ahadees' && <ListTab data={AHADEES_DATA} type="hadees" />}
        {tab === 'azkaar'  && <ListTab data={AZKAAR_DATA} type="azkar" />}
        {tab === 'prayers' && <ListTab data={PRAYERS_DATA} type="prayer" />}
        {tab === 'dajjal'  && <ListTab data={DAJJAL_DATA} type="dajjal" />}
      </View>
    </View>
  );
}

// ── Quran Tab ────────────────────────────────────────────
function QuranTab() {
  const [surahs, setSurahs] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [verses, setVerses] = useState<any[]>([]);
  const [reciter, setReciter] = useState(RECITATIONS[0].id);
  const [loading, setLoading] = useState(true);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [showUrdu, setShowUrdu] = useState(false);
  const [soundObj, setSoundObj] = useState<Audio.Sound | null>(null);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${QURAN_API}/surah`)
      .then(r => r.json())
      .then(data => { setSurahs(data.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const loadSurah = useCallback(async (num: number) => {
    setSelected(num);
    setLoadingVerses(true);
    setVerses([]);
    try {
      const [arRes, urRes] = await Promise.all([
        fetch(`${QURAN_API}/surah/${num}`).then(r => r.json()),
        fetch(`${QURAN_API}/surah/${num}/ur.ahmedali`).then(r => r.json()),
      ]);
      const arAyahs = arRes.data?.ayahs ?? [];
      const urAyahs = urRes.data?.ayahs ?? [];
      const merged = arAyahs.map((a: any, i: number) => ({
        ...a,
        ur: urAyahs[i]?.text ?? '',
      }));
      setVerses(merged);
    } catch {}
    setLoadingVerses(false);
  }, []);

  const playAyah = async (surahNum: number, ayahNum: number) => {
    try {
      if (soundObj) { await soundObj.unloadAsync(); setSoundObj(null); }
      if (playingAyah === ayahNum) { setPlayingAyah(null); return; }
      setPlayingAyah(ayahNum);
      const num = `${surahNum}`.padStart(3, '0') + `${ayahNum}`.padStart(3, '0');
      const url = `https://cdn.islamic.network/quran/audio/128/${reciter}/${
        (surahNum - 1) * 1000 + ayahNum
      }.mp3`;
      const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
      setSoundObj(sound);
      sound.setOnPlaybackStatusUpdate((s: any) => {
        if (s.isLoaded && s.didJustFinish) { setPlayingAyah(null); sound.unloadAsync(); setSoundObj(null); }
      });
    } catch { setPlayingAyah(null); }
  };

  if (selected !== null) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.surahHeader}>
          <TouchableOpacity onPress={() => { setSelected(null); soundObj?.unloadAsync(); setPlayingAyah(null); }}
            style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.surahTitle}>{surahs.find(s => s.number === selected)?.englishName ?? `Surah ${selected}`}</Text>
          <TouchableOpacity
            style={[styles.urduToggle, showUrdu && styles.urduToggleOn]}
            onPress={() => setShowUrdu(v => !v)}
          >
            <Text style={styles.urduToggleText}>{showUrdu ? 'عربی' : 'اردو'}</Text>
          </TouchableOpacity>
        </View>
        {/* Reciter selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={styles.reciterRow} contentContainerStyle={{ paddingHorizontal: 12, gap: 8, paddingVertical: 6 }}>
          {RECITATIONS.map(r => (
            <TouchableOpacity
              key={r.id}
              style={[styles.reciterChip, reciter === r.id && styles.reciterChipActive]}
              onPress={() => setReciter(r.id)}
            >
              <Text style={[styles.reciterText, reciter === r.id && styles.reciterTextActive]}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {loadingVerses ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={verses}
            keyExtractor={v => v.numberInSurah.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
            renderItem={({ item: v }) => (
              <View style={styles.ayahCard}>
                <View style={styles.ayahNumWrap}>
                  <Text style={styles.ayahNum}>{v.numberInSurah}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.arabicText}>{v.text}</Text>
                  {showUrdu ? <Text style={styles.urduText}>{v.ur}</Text> : null}
                </View>
                <TouchableOpacity
                  style={[styles.audioBtn, playingAyah === v.numberInSurah && styles.audioBtnActive]}
                  onPress={() => playAyah(selected, v.number)}
                >
                  <Ionicons
                    name={playingAyah === v.numberInSurah ? 'pause' : 'play'}
                    size={16}
                    color={playingAyah === v.numberInSurah ? '#000' : COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    );
  }

  if (loading) return <ActivityIndicator color={COLORS.primary} style={{ marginTop: 60 }} />;

  return (
    <FlatList
      data={surahs}
      keyExtractor={s => s.number.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 30 }}
      renderItem={({ item: s }) => (
        <TouchableOpacity style={styles.surahItem} onPress={() => loadSurah(s.number)}>
          <View style={styles.surahNumBox}>
            <Text style={styles.surahNumText}>{s.number}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.surahEnName}>{s.englishName}</Text>
            <Text style={styles.surahMeta}>{s.englishNameTranslation} · {s.numberOfAyahs} verses · {s.revelationType}</Text>
          </View>
          <Text style={styles.surahArName}>{s.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

// ── Generic list tab ─────────────────────────────────────
function ListTab({ data, type }: { data: any[]; type: string }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <FlatList
      data={data}
      keyExtractor={i => i.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 12, paddingBottom: 30, gap: 10 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.listCard, expanded === item.id && styles.listCardExpanded]}
          onPress={() => setExpanded(expanded === item.id ? null : item.id)}
        >
          <View style={styles.listCardHeader}>
            <Text style={styles.listCardTitle}>{item.title ?? item.text?.slice(0, 60) + '...'}</Text>
            <Ionicons name={expanded === item.id ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.primary} />
          </View>
          {expanded === item.id ? (
            <View style={styles.listCardBody}>
              {item.ar ? <Text style={styles.arText}>{item.ar}</Text> : null}
              {item.ur ? <Text style={styles.urText}>{item.ur}</Text> : null}
              {item.text ? <Text style={styles.urText}>{item.text}</Text> : null}
              {item.count && item.count > 1 ? (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>×{item.count}</Text>
                </View>
              ) : null}
              <Text style={styles.refText}>📚 {item.ref}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      )}
    />
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
  tabScroll: { maxHeight: 50, backgroundColor: COLORS.bgLight, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabRow: { paddingHorizontal: 10, paddingVertical: 8, gap: 8, alignItems: 'center' },
  tabBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: COLORS.bgLighter, borderWidth: 1, borderColor: COLORS.border,
  },
  tabBtnActive: { backgroundColor: COLORS.primaryDim, borderColor: COLORS.borderBright, ...GLOW.subtle },
  tabLabel: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  tabLabelActive: { color: COLORS.primary },
  content: { flex: 1 },
  // Surah list
  surahItem: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12,
  },
  surahNumBox: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderBright,
  },
  surahNumText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  surahEnName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  surahMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  surahArName: { fontSize: 17, color: COLORS.primary, fontWeight: '600' },
  // Surah detail
  surahHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    backgroundColor: COLORS.bgLight, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 10,
  },
  backBtn: { padding: 6 },
  surahTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: COLORS.text },
  urduToggle: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: COLORS.bgLighter, borderWidth: 1, borderColor: COLORS.border,
  },
  urduToggleOn: { backgroundColor: COLORS.primaryDim, borderColor: COLORS.borderBright },
  urduToggleText: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  reciterRow: { backgroundColor: COLORS.bgLight, borderBottomWidth: 1, borderBottomColor: COLORS.border, maxHeight: 42 },
  reciterChip: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14,
    backgroundColor: COLORS.bgLighter, borderWidth: 1, borderColor: COLORS.border,
  },
  reciterChipActive: { backgroundColor: COLORS.primaryDim, borderColor: COLORS.borderBright },
  reciterText: { fontSize: 12, color: COLORS.textMuted },
  reciterTextActive: { color: COLORS.primary, fontWeight: '700' },
  ayahCard: {
    flexDirection: 'row', backgroundColor: COLORS.bgLight, borderRadius: 12,
    padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border, gap: 10, alignItems: 'flex-start',
  },
  ayahNumWrap: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderBright,
  },
  ayahNum: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  arabicText: { fontSize: 20, color: COLORS.text, textAlign: 'right', lineHeight: 36, fontFamily: 'serif' },
  urduText: { fontSize: 14, color: COLORS.textMuted, textAlign: 'right', lineHeight: 22, marginTop: 8, fontStyle: 'italic' },
  audioBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderBright,
  },
  audioBtnActive: { backgroundColor: COLORS.primary },
  // Generic list cards
  listCard: {
    backgroundColor: COLORS.bgLight, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  listCardExpanded: { borderColor: COLORS.borderBright, ...GLOW.subtle },
  listCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  listCardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, flex: 1 },
  listCardBody: { marginTop: 12, gap: 8 },
  arText: { fontSize: 20, color: COLORS.text, textAlign: 'right', lineHeight: 34, fontFamily: 'serif' },
  urText: { fontSize: 14, color: COLORS.textMuted, lineHeight: 22 },
  countBadge: {
    alignSelf: 'flex-start', backgroundColor: COLORS.primaryDim,
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: COLORS.borderBright,
  },
  countText: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  refText: { fontSize: 12, color: COLORS.textGray, fontStyle: 'italic' },
});
