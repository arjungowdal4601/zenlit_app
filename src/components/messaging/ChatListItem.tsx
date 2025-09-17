"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Eye } from "lucide-react";
import { Chat } from "./ChatList";

interface Props {
  chat: Chat;
  isAnonymous?: boolean;
}

const ChatListItem = ({ chat, isAnonymous }: Props) => {
  const href = `/messages/${chat.id}`;

  return (
    <div className="group relative">
      <Link href={href} className="flex items-center gap-3 px-3 py-3 hover:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center shrink-0">
          {isAnonymous ? (
            <Eye size={20} className="text-gray-300" />
          ) : (
            chat.avatar ? (
              <Image src={chat.avatar} alt={chat.title ?? 'Chat'} width={48} height={48} className="object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-700" />
            )
          )}
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="truncate text-sm font-medium text-white" style={{ fontFamily: 'var(--font-inter)' }}>
              {isAnonymous ? 'Anonymous chat' : (chat.title ?? 'Untitled')}
            </div>
            <div className="ml-2 text-xs text-gray-400 shrink-0">{chat.time}</div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="truncate text-sm text-gray-400">{chat.last}</div>
            {chat.unread ? (
              <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-blue-600/20 text-blue-400 text-xs">
                {chat.unread}
              </span>
            ) : null}
          </div>
        </div>

        <ChevronRight size={18} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    </div>
  );
};

export default ChatListItem;