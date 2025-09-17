"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, MoreVertical, Eye } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  anonymous?: boolean;
}

const ChatHeader = ({ title, subtitle, avatarUrl, anonymous }: Props) => {
  return (
    <div className="sticky top-0 z-50 bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60 border-b border-slate-800">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center py-3">
          <Link href="/messages" className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <ChevronLeft className="text-white" />
          </Link>
          <div className="flex items-center gap-3 ml-3 flex-1">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center">
              {anonymous ? (
                <Eye size={18} className="text-gray-300" />
              ) : (
                avatarUrl ? (
                  <Image src={avatarUrl} alt={title} width={36} height={36} className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-700" />
                )
              )}
            </div>
            <div className="leading-tight" style={{ fontFamily: 'var(--font-inter)' }}>
              <div className="text-sm font-medium text-white">{anonymous ? 'Anonymous' : title}</div>
              {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
            </div>
          </div>
          <button className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <MoreVertical className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;