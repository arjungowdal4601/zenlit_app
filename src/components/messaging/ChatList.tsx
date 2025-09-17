"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import ChatListItem from "./ChatListItem";
import EmptyState from "./EmptyState";
import SkeletonRows from "./Skeletons";

export type MsgType = "text" | "image" | "audio" | "system";
export type ChatKind = "normal" | "anonymous";

export interface Chat {
  id: string;
  kind: ChatKind;
  title?: string; // not for anonymous
  avatar?: string; // not for anonymous
  last: string; // snippet
  time: string; // HH:mm or relative label
  unread?: number;
  muted?: boolean;
  pinned?: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: "me" | string;
  type: MsgType;
  text?: string;
  mediaUrl?: string;
  replyToId?: string;
  createdAt: string; // ISO
  status?: "sent" | "delivered" | "read";
  deleted?: boolean;
}

// Helpers
export const formatTime = (d: Date) => {
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const h12 = hours % 12 || 12;
  const ampm = hours < 12 ? "AM" : "PM";
  return `${h12}:${minutes} ${ampm}`;
};

export const dayLabel = (d: Date) => {
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yest)) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

export const groupByDay = (messages: Message[]) => {
  const groups: { label: string; items: Message[] }[] = [];
  const byLabel: Record<string, Message[]> = {};
  messages.forEach((m) => {
    const dt = new Date(m.createdAt);
    const label = dayLabel(dt);
    if (!byLabel[label]) byLabel[label] = [];
    byLabel[label].push(m);
  });
  Object.keys(byLabel).forEach((label) => {
    const items = byLabel[label].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    groups.push({ label, items });
  });
  // Sort groups by date asc
  return groups.sort((a, b) => {
    const da = new Date(a.items[0].createdAt).getTime();
    const db = new Date(b.items[0].createdAt).getTime();
    return da - db;
  });
};

// Seed Data
export const normalSeedChats: Chat[] = [
  { id: "c1", kind: "normal", title: "Alex Johnson", avatar: "https://ui-avatars.com/api/?name=Alex+J&background=111827&color=fff", last: "See you at the cafe ☕", time: "2:45 PM", unread: 2, pinned: true },
  { id: "c2", kind: "normal", title: "Sarah Chen", avatar: "https://ui-avatars.com/api/?name=Sarah+C&background=111827&color=fff", last: "Just sent the files.", time: "1:18 PM" },
  { id: "c3", kind: "normal", title: "Mike Rodriguez", avatar: "https://ui-avatars.com/api/?name=Mike+R&background=111827&color=fff", last: "Got it, thanks!", time: "12:02 PM", muted: true },
  { id: "c4", kind: "normal", title: "Emma Wilson", avatar: "https://ui-avatars.com/api/?name=Emma+W&background=111827&color=fff", last: "That sounds great 🔥", time: "Yesterday" },
  { id: "c5", kind: "normal", title: "David Kim", avatar: "https://ui-avatars.com/api/?name=David+K&background=111827&color=fff", last: "I'll check tonight.", time: "Tue" },
  { id: "c6", kind: "normal", title: "Lisa Thompson", avatar: "https://ui-avatars.com/api/?name=Lisa+T&background=111827&color=fff", last: "Amazing view!", time: "Mon" },
  { id: "c7", kind: "normal", title: "Marcus R.", avatar: "https://ui-avatars.com/api/?name=Marcus+R&background=111827&color=fff", last: "On my way 🚶", time: "Sun" },
  { id: "c8", kind: "normal", title: "Product Team", avatar: "https://ui-avatars.com/api/?name=PT&background=111827&color=fff", last: "Meeting moved to 4 PM", time: "Sat", unread: 4 },
];

export const anonymousSeedChats: Chat[] = [
  { id: "a1", kind: "anonymous", last: "Thanks for the help!", time: "1:07 PM" },
  { id: "a2", kind: "anonymous", last: "Can we keep this anonymous?", time: "Yesterday" },
  { id: "a3", kind: "anonymous", last: "Read-only sample thread.", time: "Mon" },
];

export const seedMessages: Message[] = (() => {
  const now = new Date();
  const mk = (offsetMin: number) => new Date(now.getTime() - offsetMin * 60000).toISOString();
  const msgs: Message[] = [
    { id: "m1", chatId: "c1", senderId: "c1", type: "text", text: "Hey! Reaching the cafe in 10.", createdAt: mk(300) },
    { id: "m2", chatId: "c1", senderId: "me", type: "text", text: "Perfect, see you soon ☕", createdAt: mk(290), status: "delivered" },
    { id: "m3", chatId: "c1", senderId: "c1", type: "image", mediaUrl: "/next.svg", text: "Menu looks nice", createdAt: mk(285) },

    { id: "m4", chatId: "c2", senderId: "c2", type: "text", text: "Sent the files.", createdAt: mk(200) },
    { id: "m5", chatId: "c2", senderId: "me", type: "text", text: "Received, thanks!", createdAt: mk(195), status: "read" },

    { id: "m6", chatId: "c3", senderId: "me", type: "text", text: "All good?", createdAt: mk(600), status: "sent" },
    { id: "m7", chatId: "c3", senderId: "c3", type: "text", text: "Yep, all set.", createdAt: mk(580) },

    { id: "m8", chatId: "c4", senderId: "c4", type: "text", text: "That sounds great 🔥", createdAt: mk(1440) },
    { id: "m9", chatId: "c4", senderId: "me", type: "image", mediaUrl: "/vercel.svg", text: "Look at this!", createdAt: mk(1439), status: "delivered" },

    { id: "m10", chatId: "c5", senderId: "me", type: "text", text: "I'll check tonight.", createdAt: mk(3000) },

    { id: "m11", chatId: "c6", senderId: "c6", type: "text", text: "Amazing view!", createdAt: mk(3200) },
    { id: "m12", chatId: "c6", senderId: "me", type: "text", text: "Wow 😍", createdAt: mk(3195), status: "read" },

    { id: "m13", chatId: "c7", senderId: "c7", type: "audio", text: "Voice note", createdAt: mk(5000) },
    { id: "m14", chatId: "c7", senderId: "me", type: "text", text: "Got it.", createdAt: mk(4990) },

    { id: "m15", chatId: "c8", senderId: "c8", type: "text", text: "Meeting moved to 4 PM", createdAt: mk(7000) },
    { id: "m16", chatId: "c8", senderId: "me", type: "text", text: "Noted.", createdAt: mk(6990) },

    { id: "m17", chatId: "a1", senderId: "a1", type: "text", text: "Thanks for the help!", createdAt: mk(60) },
    { id: "m18", chatId: "a2", senderId: "a2", type: "text", text: "Can we keep this anonymous?", createdAt: mk(1440 * 2) },
    { id: "m19", chatId: "a3", senderId: "a3", type: "text", text: "Read-only sample thread.", createdAt: mk(1440 * 3) },
  ];

  // Add more to reach ~35 messages across threads
  for (let i = 20; i < 36; i++) {
    const chatId = i % 2 === 0 ? "c1" : "c2";
    msgs.push({ id: `m${i}`, chatId, senderId: i % 3 === 0 ? "me" : chatId, type: "text", text: `Sample message ${i}` , createdAt: mk(8000 - i * 30)});
  }
  return msgs;
})();

// Local util to get messages of a chat sorted asc
export const getMessagesForChat = (chatId: string) =>
  seedMessages
    .filter((m) => m.chatId === chatId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

// Component
interface ChatListProps {
  normalChats: Chat[];
  anonymousChats: Chat[];
}

const ChatList = ({ normalChats, anonymousChats }: ChatListProps) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<{ normals: Chat[]; anons: Chat[] }>({ normals: normalChats, anons: anonymousChats });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    const normals = items.normals
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));

    const anons = items.anons;
    return { normals, anons };
  }, [items]);

  const handleToggle = (id: string, key: "pinned" | "muted") => {
    setItems((prev) => ({
      ...prev,
      normals: prev.normals.map((c) => (c.id === id ? { ...c, [key]: !c[key] } : c)),
    }));
  };

  const handleDelete = (id: string) => {
    setItems((prev) => ({
      normals: prev.normals.filter((c) => c.id !== id),
      anons: prev.anons.filter((c) => c.id !== id),
    }));
  };

  return (
    <div className="pb-24" style={{ fontFamily: "var(--font-inter)" }}>

      {loading ? (
        <SkeletonRows count={7} />
      ) : (
        <>
          {/* Normal Chats */}
          <div className="divide-y divide-slate-800 border-y border-slate-800 rounded-xl overflow-hidden">
            {filtered.normals.length === 0 ? (
              <EmptyState title="No results" subtitle="Try a different search." />
            ) : (
              filtered.normals.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  isAnonymous={false}
                />
              ))
            )}
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wide">
              <Eye size={14} /> Anonymous
            </div>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Anonymous Chats */}
          <div className="divide-y divide-slate-800 border-y border-slate-800 rounded-xl overflow-hidden">
            {filtered.anons.length === 0 ? (
              <EmptyState title="No anonymous chats" subtitle="Start a conversation anonymously." />
            ) : (
              filtered.anons.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  isAnonymous
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatList;