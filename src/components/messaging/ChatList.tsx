"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";

import ChatListItem from "./ChatListItem";
import EmptyState from "./EmptyState";
import SkeletonRows from "./Skeletons";
import type { Chat } from "./data";

interface ChatListProps {
  normalChats: Chat[];
  anonymousChats: Chat[];
}

const ChatList = ({ normalChats, anonymousChats }: ChatListProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const sorted = useMemo(
    () => ({
      normals: [...normalChats].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))),
      anons: [...anonymousChats],
    }),
    [normalChats, anonymousChats],
  );

  if (loading) {
    return <div className="pb-24"><SkeletonRows count={7} /></div>;
  }

  return (
    <div className="pb-24">
      <div className="divide-y divide-slate-800 border-y border-slate-800 rounded-xl overflow-hidden">
        {sorted.normals.length === 0 ? (
          <EmptyState title="No results" subtitle="Try a different search." />
        ) : (
          sorted.normals.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} isAnonymous={false} />
          ))
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
          sorted.anons.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} isAnonymous />
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
