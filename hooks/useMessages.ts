import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/template';
import { fetchMessages, sendMessage, toggleReaction, uploadMessageImage, DBMessage } from '@/services/database';

export function useMessages(conversationId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestRef = useRef<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!conversationId) return;
    if (!silent) setLoading(true);
    const data = await fetchMessages(conversationId);
    setMessages(data);
    if (!silent) setLoading(false);
    if (data.length) latestRef.current = data[data.length - 1].id;
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    load();

    // Poll every 3 seconds
    pollRef.current = setInterval(() => load(true), 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [conversationId, load]);

  const send = useCallback(async (params: {
    content: string;
    type?: 'text' | 'image' | 'voice';
    imageUri?: string;
    audioUri?: string;
    duration_seconds?: number;
    replied_to_id?: string | null;
  }) => {
    if (!user?.id || !conversationId) return;
    setSending(true);

    let image_url: string | undefined;
    if (params.type === 'image' && params.imageUri) {
      image_url = (await uploadMessageImage(params.imageUri, user.id)) ?? params.imageUri;
    }

    const msg = await sendMessage({
      conversation_id: conversationId,
      sender_id: user.id,
      content: params.content,
      type: params.type ?? 'text',
      image_url,
      audio_url: params.audioUri,
      duration_seconds: params.duration_seconds,
      replied_to_id: params.replied_to_id ?? null,
    });

    if (msg) {
      setMessages(prev => [...prev, msg]);
    }
    setSending(false);
    await load(true);
  }, [user?.id, conversationId, load]);

  const react = useCallback(async (messageId: string, emoji: string) => {
    if (!user?.id) return;
    await toggleReaction(messageId, user.id, emoji);
    await load(true);
  }, [user?.id, load]);

  return { messages, loading, sending, send, react };
}
