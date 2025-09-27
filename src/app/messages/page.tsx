import { useEffect, useState } from "react";

import AppHeader from "@/components/AppHeader";
import AppLayout from "@/components/AppLayout";
import ChatList from "@/components/messaging/ChatList";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { ChatListEntry } from "@/types/messaging";

export const dynamic = "force-dynamic";

const formatPreview = (entry: { type: string; text: string | null }) => {
  if (entry.type === 'text') return entry.text ?? 'New message';
  if (entry.type === 'image') return 'Photo';
  if (entry.type === 'audio') return 'Audio message';
  return 'System message';
};

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const [normalChats, setNormalChats] = useState<ChatListEntry[]>([]);
  const [anonymousChats, setAnonymousChats] = useState<ChatListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setLoading(false);
      setNormalChats([]);
      setAnonymousChats([]);
      return;
    }

    let cancelled = false;

    const loadChats = async () => {
      setLoading(true);
      const { data: memberships, error: membershipError } = await supabase
        .from('chat_members')
        .select('chat_id, chats(id, kind, title)')
        .eq('user_id', user.id);

      if (cancelled) return;

      if (membershipError) {
        console.error('Unable to load chats', membershipError);
        setError('Unable to load your chats. Please try again later.');
        setNormalChats([]);
        setAnonymousChats([]);
        setLoading(false);
        return;
      }

      const chatRows = (memberships ?? [])
        .map((membership) => membership.chats)
        .filter((chat): chat is { id: string; kind: 'normal' | 'anonymous'; title: string | null } => Boolean(chat));

      const entries: ChatListEntry[] = await Promise.all(
        chatRows.map(async (chat) => {
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('type, text, created_at')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            id: chat.id,
            kind: chat.kind,
            title: chat.title,
            avatarUrl: null,
            lastMessageText: lastMessage ? formatPreview(lastMessage) : null,
            lastMessageAt: lastMessage?.created_at ?? null,
          } satisfies ChatListEntry;
        })
      );

      setNormalChats(entries.filter((entry) => entry.kind === 'normal'));
      setAnonymousChats(entries.filter((entry) => entry.kind === 'anonymous'));
      setError(null);
      setLoading(false);
    };

    void loadChats();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4">
        <AppHeader title="Messages" />
        <div className="py-2">
          <ChatList normalChats={normalChats} anonymousChats={anonymousChats} loading={loading} error={error} />
        </div>
      </div>
    </AppLayout>
  );
}
