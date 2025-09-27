"use client";

import { useEffect, useMemo, useState } from "react";

import AppLayout from "../../../components/AppLayout";
import ChatHeader from "../../../components/messaging/ChatHeader";
import DayDivider from "../../../components/messaging/DayDivider";
import MessageBubble from "../../../components/messaging/MessageBubble";
import Composer from "@/components/messaging/Composer";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { MessageRow } from "@/types/messaging";

interface ChatDetailClientProps {
  chatId: string;
}

interface GroupedMessages {
  label: string;
  items: MessageRow[];
}

const groupByDay = (messages: MessageRow[]): GroupedMessages[] => {
  const groups: Record<string, MessageRow[]> = {};
  messages.forEach((message) => {
    const date = new Date(message.created_at);
    const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(message);
  });

  return Object.entries(groups)
    .map(([label, items]) => ({
      label,
      items: items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    }))
    .sort((a, b) => new Date(a.items[0].created_at).getTime() - new Date(b.items[0].created_at).getTime());
};

export default function ChatDetailClient({ chatId }: ChatDetailClientProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [chatTitle, setChatTitle] = useState<string | null>(null);
  const [chatKind, setChatKind] = useState<'normal' | 'anonymous'>('normal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadChat = async () => {
      setLoading(true);
      const [{ data: chatData, error: chatError }, { data: messageData, error: messageError }] = await Promise.all([
        supabase.from('chats').select('id, title, kind').eq('id', chatId).maybeSingle(),
        supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true }),
      ]);

      if (cancelled) return;

      if (chatError) {
        console.error('Unable to load chat', chatError);
        setError('Unable to load chat.');
        setMessages([]);
        setLoading(false);
        return;
      }

      if (!chatData) {
        setError('Chat not found.');
        setMessages([]);
        setLoading(false);
        return;
      }

      setChatTitle(chatData.title);
      setChatKind((chatData.kind as 'normal' | 'anonymous') ?? 'normal');

      if (messageError) {
        console.error('Unable to load messages', messageError);
        setMessages([]);
      } else {
        setMessages(messageData ?? []);
      }
      setError(null);
      setLoading(false);
    };

    void loadChat();

    return () => {
      cancelled = true;
    };
  }, [chatId]);

  useEffect(() => {
    const channel = supabase
      .channel(`messages:chat:${chatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          setMessages((prev) => {
            const next = [...prev, payload.new as MessageRow];
            return next.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [chatId]);

  const groups = useMemo(() => groupByDay(messages), [messages]);

  const handleSend = async (text: string) => {
    if (!user) {
      throw new Error('You must be signed in to send messages.');
    }

    setSendError(null);
    const { error: insertError } = await supabase.from('messages').insert({
      chat_id: chatId,
      sender_id: user.id,
      type: 'text',
      text,
      status: 'sent',
    });

    if (insertError) {
      setSendError('Failed to send message. Please try again.');
      throw insertError;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <ChatHeader
          title={chatTitle ?? (chatKind === 'anonymous' ? 'Anonymous' : 'Chat')}
          subtitle={undefined}
          avatarUrl={null}
          anonymous={chatKind === 'anonymous'}
        />

        <div className="px-4 py-3 space-y-4 pb-24">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-16 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-6 text-center text-sm text-red-200">
              {error}
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-10">No messages yet. Say hi!</div>
          ) : (
            groups.map((group) => (
              <div key={group.label}>
                <DayDivider label={group.label} />
                <div className="flex flex-col gap-2">
                  {group.items.map((message) => {
                    const repliedTo = message.reply_to_id
                      ? messages.find((candidate) => candidate.id === message.reply_to_id)
                      : undefined;
                    const isMe = message.sender_id === user?.id;
                    return (
                      <MessageBubble key={message.id} message={message} isMe={Boolean(isMe)} repliedTo={repliedTo} />
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {sendError && (
          <div className="px-4 pb-2 text-sm text-red-400">{sendError}</div>
        )}

        <Composer onSend={handleSend} />
      </div>
    </AppLayout>
  );
}
