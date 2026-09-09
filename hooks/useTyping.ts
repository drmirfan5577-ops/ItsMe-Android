import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/template';
import { getSupabaseClient } from '@/template';

export function useTyping(conversationId: string | null) {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isTypingRef = useRef(false);

  // Poll for who is typing
  const pollTyping = useCallback(async () => {
    if (!conversationId || !user?.id) return;
    const db = getSupabaseClient();
    const cutoff = new Date(Date.now() - 4000).toISOString(); // 4s window
    const { data } = await db
      .from('typing_status')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .neq('user_id', user.id)
      .gte('updated_at', cutoff);

    setTypingUsers(data?.map((r: any) => r.user_id) ?? []);
  }, [conversationId, user?.id]);

  useEffect(() => {
    if (!conversationId) return;
    pollRef.current = setInterval(pollTyping, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [conversationId, pollTyping]);

  // Set own typing status
  const setTyping = useCallback(async (isTyping: boolean) => {
    if (!conversationId || !user?.id) return;
    isTypingRef.current = isTyping;
    const db = getSupabaseClient();

    if (isTyping) {
      await db.from('typing_status').upsert(
        { conversation_id: conversationId, user_id: user.id, updated_at: new Date().toISOString() },
        { onConflict: 'conversation_id,user_id' }
      );
    } else {
      await db.from('typing_status')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);
    }
  }, [conversationId, user?.id]);

  return { typingUsers, setTyping };
}
