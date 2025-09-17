"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

import AppLayout from "@/components/AppLayout";
import ChatHeader from "@/components/messaging/ChatHeader";
import Composer from "@/components/messaging/Composer";
import DayDivider from "@/components/messaging/DayDivider";
import MessageBubble from "@/components/messaging/MessageBubble";
import {
  findChatById,
  getMessagesForChat,
  groupByDay,
  isAnonymousChat,
  type Message,
} from "@/components/messaging/data";

const ChatScreen = () => {
  const params = useParams<{ chatId: string }>();
  const rawChatId = params?.chatId;
  const chatId = Array.isArray(rawChatId) ? rawChatId[0] : rawChatId;

  const chat = useMemo(() => (chatId ? findChatById(chatId) : undefined), [chatId]);
  const [messages, setMessages] = useState<Message[]>(() => (chatId ? getMessagesForChat(chatId) : []));
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chatId) return;
    setMessages(getMessagesForChat(chatId));
  }, [chatId]);

  useEffect(() => {
    if (!chatId || isAnonymousChat(chat)) {
      setTyping(false);
      return;
    }

    const start = window.setTimeout(() => setTyping(true), 1200);
    const stop = window.setTimeout(() => setTyping(false), 3800);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(stop);
    };
  }, [chatId, chat]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  const grouped = useMemo(() => groupByDay(messages), [messages]);

  if (!chatId || !chat) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-10 text-gray-300">Chat not found.</div>
      </AppLayout>
    );
  }

  const draft = drafts[chatId] ?? "";
  const anonymous = isAnonymousChat(chat);

  const appendMessage = (text: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      chatId,
      senderId: "me",
      type: "text",
      text,
      createdAt: new Date().toISOString(),
      status: "sent",
    };
    setMessages((prev) => [...prev, newMessage]);
    setDrafts((prev) => ({ ...prev, [chatId]: "" }));
  };

  const handleDraftChange = (value: string) => {
    setDrafts((prev) => ({ ...prev, [chatId]: value }));
  };

  return (
    <AppLayout>
      <div className="chat-container bg-black text-white">
        <ChatHeader
          title={chat.title ?? "Anonymous"}
          subtitle={anonymous ? "Read-only" : typing ? "typing..." : "online"}
          avatarUrl={chat.avatar}
          anonymous={anonymous}
        />

        <div ref={scrollRef} className="chat-content">
          <div className="max-w-2xl mx-auto px-4 pt-4 pb-6">
            {anonymous && (
              <div className="mt-3 mb-2 text-center text-xs text-gray-400 border border-slate-800 rounded-xl py-2">
                Read-only (anonymous chat)
              </div>
            )}

            <div className="flex flex-col gap-2">
              {grouped.map((group) => (
                <div key={group.label} className="flex flex-col gap-2">
                  <DayDivider label={group.label} />
                  {group.items.map((message) => (
                    <MessageBubble key={message.id} message={message} isMe={message.senderId === "me"} />
                  ))}
                </div>
              ))}

              {!anonymous && typing && (
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

        {!anonymous && (
          <Composer
            value={draft}
            onChange={handleDraftChange}
            onSend={appendMessage}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default ChatScreen;
