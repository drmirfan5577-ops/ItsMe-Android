import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GLOW } from '@/constants/theme';

interface DocsScreenProps {
  onBack: () => void;
}

export function DocsScreen({ onBack }: DocsScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal & Documentation</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
        <DocSection title="📜 About It's me">
          <DocText>
            {"It's me"} is a real-time private messaging application built with React Native and Expo.
            It provides end-to-end conceptual security, I-Hub (Islamic content hub), E.S Hub (news & secure notes),
            group chats, voice messages, and full multimedia support.
          </DocText>
          <DocText>Version: 1.0.0 · Build Date: July 2026</DocText>
        </DocSection>

        <DocSection title="🔒 Privacy Policy">
          <DocText>
            We take your privacy seriously. This section outlines how your data is collected, used, and protected:
          </DocText>
          <BulletPoint text="Your messages are stored encrypted in our database hosted on OnSpace Cloud (Supabase-compatible)." />
          <BulletPoint text="We do not sell, share, or monetize your personal data with any third parties." />
          <BulletPoint text="User profiles store only your email and chosen username." />
          <BulletPoint text="Media files (photos, voice messages) are stored in a secure object storage bucket." />
          <BulletPoint text="E.S Notes are protected with your personal PIN and only accessible from your account." />
          <BulletPoint text="You may request full data deletion by contacting support." />
          <BulletPoint text="We use anonymous usage analytics to improve performance — no personal data is included." />
        </DocSection>

        <DocSection title="📋 Terms of Service">
          <BulletPoint text="By using this app, you agree to use it lawfully and respectfully." />
          <BulletPoint text="You must not use the app to distribute illegal, abusive, or harmful content." />
          <BulletPoint text="Accounts found violating these terms may be suspended or permanently banned." />
          <BulletPoint text="We reserve the right to update these terms at any time." />
          <BulletPoint text="The app is provided 'as is' without warranty of any kind." />
          <BulletPoint text="We are not responsible for any data loss due to force majeure or technical failure." />
        </DocSection>

        <DocSection title="⚠️ Disclaimer">
          <DocText>
            {"It's me"} is an independent application and is NOT affiliated with, endorsed by, or connected to
            WhatsApp, Meta Platforms, or any other company.
          </DocText>
          <DocText>
            Islamic content in I-Hub is sourced from public APIs (Al-Quran.cloud) and verified sources.
            We strive for accuracy but recommend consulting certified scholars for religious guidance.
          </DocText>
          <DocText>
            News links in E.S Hub are provided for convenience. We do not endorse the editorial positions
            of any linked news outlet.
          </DocText>
        </DocSection>

        <DocSection title="🌐 Open Source Credits">
          <BulletPoint text="React Native & Expo — MIT License" />
          <BulletPoint text="Supabase / OnSpace Cloud — Apache 2.0" />
          <BulletPoint text="Al-Quran.cloud API — Public Islamic API" />
          <BulletPoint text="@expo/vector-icons (Ionicons) — MIT License" />
          <BulletPoint text="expo-av, expo-image-picker, expo-notifications — MIT License" />
        </DocSection>

        <DocSection title="📬 Contact & Support">
          <DocText>For support, data requests, or feedback:</DocText>
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => Linking.openURL('mailto:support@itsme-app.com')}
          >
            <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
            <Text style={styles.contactBtnText}>support@itsme-app.com</Text>
          </TouchableOpacity>
        </DocSection>

        <Text style={styles.footer}>
          © 2026 {"It's me"} App · All rights reserved{'\n'}
          Built with ❤️ using React Native & Expo
        </Text>
      </ScrollView>
    </View>
  );
}

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function DocText({ children }: { children: string }) {
  return <Text style={styles.docText}>{children}</Text>;
}

function BulletPoint({ text }: { text: string }) {
  return (
    <View style={styles.bullet}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
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
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, flex: 1 },
  section: {
    backgroundColor: COLORS.bgLight, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 15, fontWeight: '800', color: COLORS.primary, padding: 14,
    backgroundColor: COLORS.primaryDim, borderBottomWidth: 1, borderBottomColor: COLORS.borderBright,
  },
  sectionBody: { padding: 14, gap: 10 },
  docText: { fontSize: 14, color: COLORS.textMuted, lineHeight: 22 },
  bullet: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  bulletDot: { fontSize: 16, color: COLORS.primary, marginTop: 1 },
  bulletText: { fontSize: 14, color: COLORS.textMuted, lineHeight: 22, flex: 1 },
  contactBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primaryDim,
    padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.borderBright,
    alignSelf: 'flex-start',
  },
  contactBtnText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  footer: { fontSize: 12, color: COLORS.textGray, textAlign: 'center', lineHeight: 20, paddingTop: 4 },
});
