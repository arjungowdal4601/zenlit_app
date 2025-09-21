"use client";

import Image from "next/image";
import { Check, CheckCheck } from "lucide-react";
import type { Message } from "./data";

interface Props {
  message: Message;
  isMe: boolean;
  repliedTo?: Message;
}

const MessageBubble = ({ message, isMe, repliedTo }: Props) => {
  const bubbleBase = isMe
    ? "self-end text-white bg-blue-600"
    : "self-start bg-slate-900 text-gray-100";

  const radius = isMe ? "rounded-2xl rounded-tr-md" : "rounded-2xl rounded-tl-md";

  return (
    <div className={`max-w-[78%] px-3 py-2 ${bubbleBase} ${radius} shadow-[0_4px_12px_rgba(0,0,0,0.25)]`}>
      {message.deleted ? (
        <div className="text-sm text-gray-400 italic">Message deleted</div>
      ) : (
        <div className="space-y-2">
          {repliedTo && (
            <div className="border-l-2 border-slate-700 pl-2 text-xs text-gray-300 truncate">
              {repliedTo.text ?? (repliedTo.type === 'image' ? 'Photo' : 'Message')}
            </div>
          )}
          {message.type === 'text' && (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</div>
          )}
          {message.type === 'image' && message.mediaUrl && (
            <button className="block overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
              <Image src={message.mediaUrl} alt={message.text ?? 'image'} width={320} height={180} className="h-auto w-full" />
            </button>
          )}
          {message.type === 'audio' && (
            <div className="h-8 w-40 bg-slate-800 rounded-full" />
          )}
        </div>
      )}
      <div className={`mt-1 flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
        <span className={`text-[11px] ${isMe ? 'text-white/80' : 'text-gray-400'}`}>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        {isMe && (
          message.status === 'read' ? <CheckCheck size={14} className="text-white/90" /> : <Check size={14} className="text-white/70" />
        )}
      </div>
    </div>
  );
};

export default MessageBubble;