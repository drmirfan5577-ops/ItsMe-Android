import { getSupabaseClient } from '@/template';

export interface DBConversation {
  id: string;
  type: 'direct' | 'group';
  name: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // joined from members + profiles
  other_user?: { id: string; username: string; email: string };
  last_message?: DBMessage | null;
  unread_count?: number;
  members?: { user_id: string; username: string }[];
}

export interface DBMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'image' | 'voice';
  image_url: string | null;
  audio_url: string | null;
  duration_seconds: number | null;
  replied_to_id: string | null;
  created_at: string;
  sender?: { username: string; email: string };
  reactions?: DBReaction[];
}

export interface DBReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  user?: { username: string };
}

export interface DBProfile {
  id: string;
  username: string;
  email: string;
}

// ─── Conversations ───────────────────────────────────────
export async function fetchConversations(userId: string): Promise<DBConversation[]> {
  const db = getSupabaseClient();

  // Get conversation IDs for this user
  const { data: memberRows, error: memErr } = await db
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', userId);

  if (memErr || !memberRows?.length) return [];

  const convIds = memberRows.map(r => r.conversation_id);

  // Fetch conversations
  const { data: convs, error: convErr } = await db
    .from('conversations')
    .select('*')
    .in('id', convIds)
    .order('updated_at', { ascending: false });

  if (convErr || !convs?.length) return [];

  // For each conversation, fetch other members' profiles and last message
  const enriched = await Promise.all(
    convs.map(async (conv) => {
      // Members
      const { data: members } = await db
        .from('conversation_members')
        .select('user_id, user_profiles(id, username, email)')
        .eq('conversation_id', conv.id);

      const otherMember = members?.find((m: any) => m.user_id !== userId);
      const other_user = otherMember ? (otherMember as any).user_profiles : null;
      const allMembers = members?.map((m: any) => ({
        user_id: m.user_id,
        username: m.user_profiles?.username ?? m.user_profiles?.email ?? 'User',
      })) ?? [];

      // Last message
      const { data: lastMsgs } = await db
        .from('messages')
        .select('*, sender:user_profiles!sender_id(username, email)')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1);

      return {
        ...conv,
        other_user,
        last_message: lastMsgs?.[0] ?? null,
        members: allMembers,
      } as DBConversation;
    })
  );

  return enriched;
}

export async function createDirectConversation(creatorId: string, targetId: string): Promise<string | null> {
  const db = getSupabaseClient();

  // Check if direct conversation already exists between these two users
  const { data: existing } = await db
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', creatorId);

  if (existing?.length) {
    const myConvIds = existing.map(r => r.conversation_id);
    const { data: shared } = await db
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', targetId)
      .in('conversation_id', myConvIds);

    if (shared?.length) {
      // Check if it's a direct conversation
      const { data: directConv } = await db
        .from('conversations')
        .select('id')
        .eq('type', 'direct')
        .in('id', shared.map(r => r.conversation_id))
        .limit(1);

      if (directConv?.length) return directConv[0].id;
    }
  }

  // Create new conversation
  const { data: conv, error: convErr } = await db
    .from('conversations')
    .insert({ type: 'direct', created_by: creatorId })
    .select()
    .single();

  if (convErr || !conv) return null;

  // Add both members
  await db.from('conversation_members').insert([
    { conversation_id: conv.id, user_id: creatorId },
    { conversation_id: conv.id, user_id: targetId },
  ]);

  return conv.id;
}

// ─── Messages ────────────────────────────────────────────
export async function fetchMessages(conversationId: string): Promise<DBMessage[]> {
  const db = getSupabaseClient();
  const { data, error } = await db
    .from('messages')
    .select(`
      *,
      sender:user_profiles!sender_id(username, email),
      reactions:message_reactions(id, message_id, user_id, emoji, user:user_profiles!user_id(username))
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) return [];
  return data ?? [];
}

export async function sendMessage(params: {
  conversation_id: string;
  sender_id: string;
  content: string;
  type?: 'text' | 'image' | 'voice';
  image_url?: string;
  audio_url?: string;
  duration_seconds?: number;
  replied_to_id?: string | null;
}): Promise<DBMessage | null> {
  const db = getSupabaseClient();
  const { data, error } = await db
    .from('messages')
    .insert({ ...params, type: params.type ?? 'text' })
    .select(`*, sender:user_profiles!sender_id(username, email)`)
    .single();

  if (error) return null;

  // Touch updated_at on conversation
  await db
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', params.conversation_id);

  return data;
}

// ─── Reactions ───────────────────────────────────────────
export async function toggleReaction(messageId: string, userId: string, emoji: string): Promise<void> {
  const db = getSupabaseClient();
  // Check if reaction exists
  const { data: existing } = await db
    .from('message_reactions')
    .select('id')
    .eq('message_id', messageId)
    .eq('user_id', userId)
    .eq('emoji', emoji)
    .maybeSingle();

  if (existing) {
    await db.from('message_reactions').delete().eq('id', existing.id);
  } else {
    await db.from('message_reactions').insert({ message_id: messageId, user_id: userId, emoji });
  }
}

// ─── Group Conversations ────────────────────────────────────
export async function createGroupConversation(
  creatorId: string,
  memberIds: string[],
  name: string
): Promise<string | null> {
  const db = getSupabaseClient();
  const { data: conv, error } = await db
    .from('conversations')
    .insert({ type: 'group', name, created_by: creatorId })
    .select()
    .single();
  if (error || !conv) return null;

  const allMembers = [creatorId, ...memberIds.filter(id => id !== creatorId)];
  await db.from('conversation_members').insert(
    allMembers.map(uid => ({ conversation_id: conv.id, user_id: uid }))
  );
  return conv.id;
}

// ─── User Discovery ───────────────────────────────────────
export async function searchUsers(query: string, excludeId: string): Promise<DBProfile[]> {
  const db = getSupabaseClient();
  const { data, error } = await db
    .from('user_profiles')
    .select('id, username, email')
    .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
    .neq('id', excludeId)
    .limit(20);

  if (error) return [];
  return data ?? [];
}

// ─── File Upload ─────────────────────────────────────────
export async function uploadMessageImage(uri: string, userId: string): Promise<string | null> {
  const db = getSupabaseClient();
  try {
    const filename = `msg_${userId}_${Date.now()}.jpg`;
    const response = await fetch(uri);
    const blob = await response.blob();

    // Convert blob to ArrayBuffer for mobile compatibility
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });

    const { data, error } = await db.storage
      .from('message-media')
      .upload(filename, arrayBuffer, { contentType: 'image/jpeg' });

    if (error) return null;

    const { data: urlData } = db.storage.from('message-media').getPublicUrl(filename);
    return urlData.publicUrl;
  } catch {
    return null;
  }
}
