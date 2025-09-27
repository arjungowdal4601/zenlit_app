import type { Tables } from '@/utils/supabase';

export type ChatKind = 'normal' | 'anonymous';
export type MessageType = 'text' | 'image' | 'audio' | 'system';

export interface ChatListEntry {
  id: string;
  kind: ChatKind;
  title: string | null;
  avatarUrl: string | null;
  lastMessageText: string | null;
  lastMessageAt: string | null;
}

export type MessageRow = Tables['messages'];
