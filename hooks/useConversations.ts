import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/template';
import { fetchConversations, createDirectConversation, createGroupConversation, DBConversation } from '@/services/database';

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<DBConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const data = await fetchConversations(user.id);
    setConversations(data);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    load();

    // Poll every 5 seconds for new chats/last messages
    pollRef.current = setInterval(load, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [user?.id, load]);

  const startDirectChat = useCallback(async (targetUserId: string): Promise<string | null> => {
    if (!user?.id) return null;
    const convId = await createDirectConversation(user.id, targetUserId);
    if (convId) load();
    return convId;
  }, [user?.id, load]);

  const startGroupChat = useCallback(async (memberIds: string[], name: string): Promise<string | null> => {
    if (!user?.id) return null;
    const convId = await createGroupConversation(user.id, memberIds, name);
    if (convId) await load();
    return convId;
  }, [user?.id, load]);

  return { conversations, loading, refresh: load, startDirectChat, startGroupChat };
}
