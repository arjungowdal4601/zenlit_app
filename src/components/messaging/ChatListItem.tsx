"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Eye } from "lucide-react";

import type { ChatListEntry } from "@/types/messaging";

interface Props {
  chat: ChatListEntry;
  isAnonymous?: boolean;
}

const formatTime = (isoDate: string | null) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatListItem = ({ chat, isAnonymous }: Props) => {
  const href = `/messages/${chat.id}`;
  const subtitle = chat.lastMessageText ?? (isAnonymous ? 'Start the conversation anonymously' : 'Say hello');

  return (
    <div className="group relative">
      <Link
        href={href}
        className="flex items-center gap-3 px-3 py-3 hover:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
      >
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center shrink-0">
          {isAnonymous ? (
            <Eye size={20} className="text-gray-300" />
          ) : chat.avatarUrl ? (
            <Image src={chat.avatarUrl} alt={chat.title ?? 'Chat'} width={48} height={48} className="object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-700" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="truncate text-sm font-medium text-white">
              {isAnonymous ? 'Anonymous chat' : chat.title ?? 'Untitled chat'}
            </div>
            <div className="ml-2 text-xs text-gray-400 shrink-0">{formatTime(chat.lastMessageAt)}</div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="truncate text-sm text-gray-400">{subtitle}</div>
          </div>
        </div>

        <ChevronRight size={18} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    </div>
  );
};

export default ChatListItem;
