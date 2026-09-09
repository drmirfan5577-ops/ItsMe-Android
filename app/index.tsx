import React, { useState, useEffect } from 'react';
import { View, StatusBar, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/template';
import { COLORS, GLOW } from '@/constants/theme';
import { useConversations } from '@/hooks/useConversations';
import { DBConversation } from '@/services/database';
import { registerForPushNotifications } from '@/services/notifications';
import {
  BottomNav, ChatsScreen, ChatScreen, StatusScreen, StatusViewer,
  CallsScreen, CallScreen, CommunitiesScreen, ProfileScreen,
  SettingsScreen, AuthScreen, AddContactScreen, GlobalSearchScreen,
  CreateGroupScreen, IHubScreen, ESHubScreen, AdminPanelScreen, DocsScreen,
} from '@/components';
import { StatusItem } from '@/services/mockData';

type Tab = 'chats' | 'status' | 'communities' | 'ihub' | 'eshub' | 'settings';

type OverlayScreen =
  | { type: 'chat'; conv: DBConversation }
  | { type: 'addContact' }
  | { type: 'createGroup' }
  | { type: 'search' }
  | { type: 'statusViewer'; status: StatusItem }
  | { type: 'call'; call: any }
  | { type: 'admin' }
  | { type: 'docs' }
  | null;

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { conversations, loading: convsLoading, refresh, startDirectChat, startGroupChat } = useConversations();

  const [currentTab, setCurrentTab] = useState<Tab>('chats');
  const [overlay, setOverlay] = useState<OverlayScreen>(null);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => { registerForPushNotifications(); }, []);

  // ── Loading splash ──────────────────────────────────────────
  if (authLoading) {
    return (
      <View style={styles.splash}>
        <View style={styles.splashOrb1} />
        <View style={styles.splashOrb2} />
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>💬</Text>
        </View>
        <Text style={styles.splashTitle}>{"It's me"}</Text>
        <Text style={styles.splashSub}>Private · Secure · Real-time</Text>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      </View>
    );
  }

  // ── Auth gate ───────────────────────────────────────────────
  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <AuthScreen />
      </SafeAreaView>
    );
  }

  // ── Overlay screens ─────────────────────────────────────────
  const renderOverlay = () => {
    if (!overlay) return null;
    switch (overlay.type) {
      case 'call':
        return <CallScreen call={overlay.call} onEnd={() => setOverlay(null)} />;
      case 'statusViewer':
        return <StatusViewer status={overlay.status} onClose={() => setOverlay(null)} />;
      case 'search':
        return (
          <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
            <GlobalSearchScreen
              conversations={conversations}
              onClose={() => setOverlay(null)}
              onOpenChat={conv => setOverlay({ type: 'chat', conv })}
            />
          </SafeAreaView>
        );
      case 'chat':
        return (
          <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
            <ChatScreen
              conv={overlay.conv}
              onBack={() => { setOverlay(null); refresh(); }}
              onCall={callType => setOverlay({ type: 'call', call: { ...overlay.conv, callType, name: overlay.conv.other_user?.username ?? 'User' } })}
            />
          </SafeAreaView>
        );
      case 'addContact':
        return (
          <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
            <AddContactScreen
              onBack={() => setOverlay(null)}
              onStartChat={async (userId) => {
                const convId = await startDirectChat(userId);
                await refresh();
                if (convId) {
                  const conv = conversations.find(c => c.id === convId);
                  setOverlay(conv ? { type: 'chat', conv } : null);
                } else { setOverlay(null); }
              }}
            />
          </SafeAreaView>
        );
      case 'createGroup':
        return (
          <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
            <CreateGroupScreen
              onBack={() => setOverlay(null)}
              onGroupCreated={async convId => {
                await refresh();
                const conv = conversations.find(c => c.id === convId);
                setOverlay(conv ? { type: 'chat', conv } : null);
              }}
            />
          </SafeAreaView>
        );
      case 'admin':
        return (
          <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
            <AdminPanelScreen onBack={() => setOverlay(null)} />
          </SafeAreaView>
        );
      case 'docs':
        return (
          <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
            <DocsScreen onBack={() => setOverlay(null)} />
          </SafeAreaView>
        );
      default:
        return null;
    }
  };

  const overlayContent = renderOverlay();
  if (overlayContent) return overlayContent;

  // ── Main app ─────────────────────────────────────────────────
  const totalUnread = conversations.reduce((n, c) => n + (c.unread_count ?? 0), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {currentTab === 'chats' && (
        <ChatsScreen
          conversations={conversations}
          currentUserId={user.id}
          onChatPress={conv => setOverlay({ type: 'chat', conv })}
          onNewChat={() => setOverlay({ type: 'addContact' })}
          onNewGroup={() => setOverlay({ type: 'createGroup' })}
          onSearch={() => setOverlay({ type: 'search' })}
        />
      )}
      {currentTab === 'status' && (
        <StatusScreen onViewStatus={status => setOverlay({ type: 'statusViewer', status })} />
      )}
      {currentTab === 'communities' && <CommunitiesScreen />}
      {currentTab === 'ihub' && <IHubScreen />}
      {currentTab === 'eshub' && <ESHubScreen />}
      {currentTab === 'settings' && (
        <SettingsScreen
          onBack={() => setCurrentTab('chats')}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onOpenAdmin={() => setOverlay({ type: 'admin' })}
          onOpenDocs={() => setOverlay({ type: 'docs' })}
        />
      )}

      {currentTab !== 'settings' && (
        <BottomNav
          current={currentTab}
          onChange={t => setCurrentTab(t as Tab)}
          totalUnread={totalUnread}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  splash: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  splashOrb1: {
    position: 'absolute', width: 320, height: 320, borderRadius: 160,
    backgroundColor: 'rgba(0,229,160,0.04)', top: -80, left: -80,
  },
  splashOrb2: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(77,200,255,0.04)', bottom: -60, right: -60,
  },
  logoCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    borderWidth: 2, borderColor: COLORS.borderBright, ...GLOW.primary,
  },
  logoEmoji: { fontSize: 46 },
  splashTitle: {
    fontSize: 40, fontWeight: '800', color: COLORS.primary, letterSpacing: 2,
    textShadowColor: COLORS.glowPrimary, textShadowRadius: 20, textShadowOffset: { width: 0, height: 0 },
  },
  splashSub: { fontSize: 14, color: COLORS.textMuted, marginTop: 6, letterSpacing: 1 },
});
