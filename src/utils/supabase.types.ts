export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          bio: string | null;
          social_links: Json | null;
          avatar_url: string | null;
          banner_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          bio?: string | null;
          social_links?: Json | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          bio?: string | null;
          social_links?: Json | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      posts: {
        Row: {
          id: string;
          author_id: string | null;
          content: string;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_id?: string | null;
          content: string;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string | null;
          content?: string;
          image_url?: string | null;
          created_at?: string;
        };
      };
      chats: {
        Row: {
          id: string;
          kind: 'normal' | 'anonymous';
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          kind: 'normal' | 'anonymous';
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          kind?: 'normal' | 'anonymous';
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_members: {
        Row: {
          chat_id: string;
          user_id: string;
        };
        Insert: {
          chat_id: string;
          user_id: string;
        };
        Update: {
          chat_id?: string;
          user_id?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          sender_id: string;
          type: 'text' | 'image' | 'audio' | 'system';
          text: string | null;
          media_url: string | null;
          reply_to_id: string | null;
          created_at: string;
          status: 'sent' | 'delivered' | 'read' | null;
        };
        Insert: {
          id?: string;
          chat_id: string;
          sender_id: string;
          type: 'text' | 'image' | 'audio' | 'system';
          text?: string | null;
          media_url?: string | null;
          reply_to_id?: string | null;
          created_at?: string;
          status?: 'sent' | 'delivered' | 'read' | null;
        };
        Update: {
          id?: string;
          chat_id?: string;
          sender_id?: string;
          type?: 'text' | 'image' | 'audio' | 'system';
          text?: string | null;
          media_url?: string | null;
          reply_to_id?: string | null;
          created_at?: string;
          status?: 'sent' | 'delivered' | 'read' | null;
        };
      };
      feedback: {
        Row: {
          id: string;
          created_at: string | null;
          content: string;
          user_id: string | null;
          category: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          content: string;
          user_id?: string | null;
          category?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          content?: string;
          user_id?: string | null;
          category?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type PublicSchema = Database["public"];
