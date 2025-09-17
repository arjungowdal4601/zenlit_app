"use client";

import { use, useState, useEffect, useMemo, useRef } from 'react';
import ChatHeader from '@/components/messaging/ChatHeader';
import MessageBubble from '@/components/messaging/MessageBubble';
import Composer from '@/components/messaging/Composer';
import DayDivider from '@/components/messaging/DayDivider';
import AppLayout from '@/components/AppLayout';
import { Chat, normalSeedChats, anonymousSeedChats, groupByDay, Message, getMessagesForChat, MsgType } from '@/components/messaging/ChatList';

interface Params { params: Promise<{ chatId: string }> }

export default function ChatScreen({ params }: Params) {
  const { chatId } = use(params);
  const chat: Chat | undefined = useMemo(() => {
    const n = normalSeedChats.find(c => c.id === chatId);
    if (n) return n;
    return anonymousSeedChats.find(c => c.id === chatId);
  }, [chatId]);

  const isAnonymous = chat?.kind === 'anonymous';
  const [messages, setMessages] = useState<Message[]>(() => getMessagesForChat(chatId));
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [typing, setTyping] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Reset messages from seeds when chatId changes
    setMessages(getMessagesForChat(chatId));
  }, [chatId]);

  useEffect(() => {
    // Fake typing toggle (UI-only)
    if (isAnonymous) return;
    const t = setTimeout(() => setTyping(true), 1200);
    const t2 = setTimeout(() => setTyping(false), 3800);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [chatId, isAnonymous]);

  useEffect(() => {
    // Scroll to bottom when messages change
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  if (!chat) return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-10 text-gray-300">Chat not found.</div>
    </AppLayout>
  );

  const grouped = useMemo(() => groupByDay(messages), [messages]);

  const handleSend = (text: string) => {
    const newMsg: Message = {
      id: `m_${Date.now()}`,
      chatId: chatId,
      senderId: 'me',
      type: 'text',
      text,
      createdAt: new Date().toISOString(),
      status: 'sent'
    };
    setMessages(prev => [...prev, newMsg]);
    setDrafts(prev => ({ ...prev, [chatId]: '' }));
  };

  const draft = drafts[chatId] ?? '';

  return (
    <div className="chat-container bg-black text-white">
      <ChatHeader
        title={chat.title ?? 'Anonymous'}
        subtitle={isAnonymous ? 'Read-only' : (typing ? 'typing…' : 'online')}
        avatarUrl={chat.avatar}
        anonymous={isAnonymous}
      />

      <div className="chat-content">
        <div className="max-w-2xl mx-auto px-4 pt-4">
          {/* Read-only banner for anonymous */}
          {isAnonymous && (
            <div className="mt-3 mb-2 text-center text-xs text-gray-400 border border-slate-800 rounded-xl py-2" style={{ fontFamily: 'var(--font-inter)' }}>
              Read-only (anonymous chat)
            </div>
          )}

          <div ref={viewportRef} className="pb-4 pt-2 flex flex-col gap-2">
            {grouped.map(group => (
              <div key={group.label} className="flex flex-col gap-2">
                <DayDivider label={group.label} />
                {group.items.map(m => (
                  <MessageBubble key={m.id} message={m} isMe={m.senderId === 'me'} />
                ))}
              </div>
            ))}

            {!isAnonymous && typing && (
              <div className="self-start bg-slate-900 rounded-2xl rounded-tl-md px-3 py-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isAnonymous && (
        <Composer
          value={draft}
          onChange={(v) => setDrafts(prev => ({ ...prev, [chatId]: v }))}
          onSend={(text) => {
            const newMessage: Message = {
              id: `msg-${Date.now()}`,
              text,
              senderId: 'me',
              chatId: chatId,
              type: 'text' as MsgType,
              createdAt: new Date().toISOString(),
            };
            setMessages(prev => [...prev, newMessage]);
            setDrafts(prev => ({ ...prev, [chatId]: '' }));
          }}
        />
      )}
    </div>
  );
}