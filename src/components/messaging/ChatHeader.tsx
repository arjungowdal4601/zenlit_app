"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  anonymous?: boolean;
}

const ChatHeader = ({ title, subtitle, avatarUrl, anonymous }: ChatHeaderProps) => {
  return (
    <div className="sticky top-0 z-50 bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60 border-b border-slate-800">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link
              href="/messages"
              aria-label="Back to messages"
              className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ArrowLeft className="text-white" />
            </Link>

            <div className="flex items-center gap-3">
              {avatarUrl && (
                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                  <Image src={avatarUrl} alt={title} fill className="object-cover" />
                </div>
              )}
              <div>
                <div className="text-white font-medium leading-tight">{title}</div>
                {subtitle && (
                  <div className="text-xs text-gray-400 leading-tight">{subtitle}</div>
                )}
              </div>
            </div>
          </div>

          <div className="w-10" />
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;