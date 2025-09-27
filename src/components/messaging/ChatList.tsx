"use client";

import { useMemo } from "react";
import { Eye } from "lucide-react";

import type { ChatListEntry } from "@/types/messaging";

import ChatListItem from "./ChatListItem";
import EmptyState from "./EmptyState";

interface ChatListProps {
  normalChats: ChatListEntry[];
  anonymousChats: ChatListEntry[];
  loading?: boolean;
  error?: string | null;
}

const ChatList = ({ normalChats, anonymousChats, loading = false, error = null }: ChatListProps) => {
  const sorted = useMemo(
    () => ({
      normals: [...normalChats].sort((a, b) => {
        if (a.lastMessageAt && b.lastMessageAt) {
          return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
        }
        if (a.lastMessageAt) return -1;
        if (b.lastMessageAt) return 1;
        return 0;
      }),
      anons: [...anonymousChats].sort((a, b) => {
        if (a.lastMessageAt && b.lastMessageAt) {
          return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
        }
        if (a.lastMessageAt) return -1;
        if (b.lastMessageAt) return 1;
        return 0;
      }),
    }),
    [normalChats, anonymousChats],
  );

  if (loading) {
    return (
      <div className="pb-24 space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-20 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-24">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-6 text-center text-sm text-red-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="divide-y divide-slate-800 border-y border-slate-800 rounded-xl overflow-hidden">
        {sorted.normals.length === 0 ? (
          <EmptyState title="No chats" subtitle="Start a conversation to see it here." />
        ) : (
          sorted.normals.map((chat) => <ChatListItem key={chat.id} chat={chat} isAnonymous={false} />)
        )}
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-800" />
        <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wide">
          <Eye size={14} /> Anonymous
        </div>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      <div className="divide-y divide-slate-800 border-y border-slate-800 rounded-xl overflow-hidden">
        {sorted.anons.length === 0 ? (
          <EmptyState title="No anonymous chats" subtitle="Start a conversation anonymously." />
        ) : (
          sorted.anons.map((chat) => <ChatListItem key={chat.id} chat={chat} isAnonymous />)
        )}
      </div>
    </div>
  );
};

export default ChatList;
