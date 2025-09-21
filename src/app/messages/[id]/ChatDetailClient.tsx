"use client";

import { useMemo, useState } from "react";
import AppLayout from "../../../components/AppLayout";
import ChatHeader from "../../../components/messaging/ChatHeader";
import DayDivider from "../../../components/messaging/DayDivider";
import MessageBubble from "../../../components/messaging/MessageBubble";
import Composer from "@/components/messaging/Composer";
import {
  findChatById,
  getMessagesForChat,
  groupByDay,
  isAnonymousChat,
  type Message,
} from "@/components/messaging/data";

interface ChatDetailClientProps {
  chatId: string;
}

export default function ChatDetailClient({ chatId }: ChatDetailClientProps) {
  const chat = findChatById(chatId);

  // Seeded messages for this chat; keep local state for demo send
  const [messages, setMessages] = useState<Message[]>(() => getMessagesForChat(chatId));

  const groups = useMemo(() => groupByDay(messages), [messages]);

  const handleSend = (text: string) => {
    const newMsg: Message = {
      id: `local-${Date.now()}`,
      chatId,
      senderId: "me",
      type: "text",
      text,
      createdAt: new Date().toISOString(),
      status: "sent",
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const title = chat?.title ?? (isAnonymousChat(chat) ? "Anonymous" : "Unknown Chat");

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <ChatHeader
          title={title}
          subtitle={undefined}
          avatarUrl={chat?.avatar}
          anonymous={isAnonymousChat(chat)}
        />

        {/* Conversation */}
        <div className="px-4 py-3 space-y-4 pb-24">
          {groups.map((group) => (
            <div key={group.label}>
              <DayDivider label={group.label} />
              <div className="flex flex-col gap-2">
                {group.items.map((m) => {
                  const repliedTo = m.replyToId
                    ? messages.find((x) => x.id === m.replyToId)
                    : undefined;
                  const isMe = m.senderId === "me";
                  return (
                    <MessageBubble key={m.id} message={m} isMe={isMe} repliedTo={repliedTo} />
                  );
                })}
              </div>
            </div>
          ))}

          {groups.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-10">
              No messages yet. Say hi!
            </div>
          )}
        </div>

        {/* Composer */}
        <Composer onSend={handleSend} />
      </div>
    </AppLayout>
  );
}
