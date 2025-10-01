import { supabase } from '@/utils/supabaseClient';
import type { Chat, Message as UiMessage } from '@/components/messaging/data';
import { dayLabel, formatTime } from '@/components/messaging/data';

// Build chat list for the current user by grouping messages by the other participant
export async function getChatsForUser(currentUserId: string, nearbyUserIds: string[]): Promise<{ normalChats: Chat[]; anonymousChats: Chat[]; }>{
  // Fetch all messages where the current user is either the sender or receiver
  const { data: rows, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
    .order('sent_at', { ascending: false });

  if (error) throw new Error(error.message);

  const chatMap: Record<string, { lastText: string; lastTime: string; unread: number; lastAt: string }> = {};

  rows?.forEach((m: any) => {
    const otherId = m.sender_id === currentUserId ? m.receiver_id : m.sender_id;
    if (!chatMap[otherId]) {
      chatMap[otherId] = { lastText: '', lastTime: '', unread: 0, lastAt: m.sent_at };
    }
    // Update last message if newer (rows are sorted desc, so first hit is latest)
    if (!chatMap[otherId].lastText) {
      chatMap[otherId].lastText = m.text ?? (m.image_url ? 'Photo' : '');
      const d = new Date(m.sent_at);
      const label = dayLabel(d);
      chatMap[otherId].lastTime = label === 'Today' ? formatTime(d) : label;
    }
    // Unread count (messages to me that are not read)
    if (m.receiver_id === currentUserId && !m.is_read) {
      chatMap[otherId].unread += 1;
    }
  });

  const otherIds = Object.keys(chatMap);
  if (otherIds.length === 0) {
    return { normalChats: [], anonymousChats: [] };
  }

  // Fetch profile and avatar for nearby users only
  const nearbySet = new Set(nearbyUserIds);
  const nearbyIds = otherIds.filter((id) => nearbySet.has(id));

  let profiles: Record<string, { display_name?: string | null; avatar?: string | null }> = {};
  if (nearbyIds.length > 0) {
    const { data: profileRows, error: profErr } = await supabase
      .from('profiles')
      .select(`id, display_name, social_links ( profile_pic_url )`)
      .in('id', nearbyIds);
    if (profErr) throw new Error(profErr.message);
    (profileRows || []).forEach((p: any) => {
      profiles[p.id] = {
        display_name: p.display_name,
        avatar: p.social_links?.profile_pic_url ?? null,
      };
    });
  }

  const normalChats: Chat[] = [];
  const anonymousChats: Chat[] = [];

  otherIds.forEach((id) => {
    const meta = chatMap[id];
    const base = {
      id,
      last: meta.lastText,
      time: meta.lastTime,
      unread: meta.unread || undefined,
      muted: false,
      pinned: false,
    } as Chat;

    if (nearbySet.has(id)) {
      normalChats.push({
        ...base,
        kind: 'normal',
        title: profiles[id]?.display_name ?? 'Nearby user',
        avatar: profiles[id]?.avatar ?? undefined,
      });
    } else {
      anonymousChats.push({
        ...base,
        kind: 'anonymous',
      });
    }
  });

  return { normalChats, anonymousChats };
}

// Fetch ordered messages between the current user and another user
export async function getMessagesBetweenUsers(currentUserId: string, otherUserId: string): Promise<UiMessage[]> {
  const { data: rows, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
    .order('sent_at', { ascending: true });

  if (error) throw new Error(error.message);

  return (rows || []).map((m: any) => {
    const isMe = m.sender_id === currentUserId;
    const type: UiMessage['type'] = m.image_url ? 'image' : 'text';
    const message: UiMessage = {
      id: m.id,
      chatId: otherUserId,
      senderId: isMe ? 'me' : otherUserId,
      type,
      text: m.text ?? undefined,
      mediaUrl: m.image_url ?? undefined,
      createdAt: m.sent_at,
      status: m.is_read ? 'read' : 'delivered',
    };
    return message;
  });
}

export async function sendTextMessage(currentUserId: string, otherUserId: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return { error: 'Empty message' };
  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: currentUserId, receiver_id: otherUserId, text: trimmed })
    .select()
    .single();
  if (error) return { error: error.message };
  return { data };
}

// Seed a sample anonymous conversation for the current user
export async function seedSampleConversation(currentUserId: string) {
  const otherUserId = 'a1'; // demo participant id (no auth record required)

  // If conversation already exists, skip seeding
  const { data: existing, error: checkErr } = await supabase
    .from('messages')
    .select('id')
    .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
    .limit(1);
  if (checkErr) return { error: checkErr.message };
  if (existing && existing.length > 0) return { data: { otherUserId } };

  const now = Date.now();
  const iso = (minsAgo: number) => new Date(now - minsAgo * 60_000).toISOString();

  const rows = [
    { sender_id: otherUserId, receiver_id: currentUserId, text: 'Hi there! Thanks for the help.', sent_at: iso(60), is_read: true },
    { sender_id: currentUserId, receiver_id: otherUserId, text: 'Happy to help! How can I assist?', sent_at: iso(58), is_read: false },
    { sender_id: otherUserId, receiver_id: currentUserId, text: 'Can we keep this anonymous?', sent_at: iso(56), is_read: false },
    // Image message (hidden in anonymous mode by UI)
    { sender_id: otherUserId, receiver_id: currentUserId, image_url: '/next.svg', text: 'Photo', sent_at: iso(55), is_read: false },
  ];

  const { data, error } = await supabase.from('messages').insert(rows).select();
  if (error) return { error: error.message };
  return { data: { otherUserId } };
}

export async function seedComprehensiveConversations(currentUserId: string) {
  const now = Date.now();
  const iso = (minsAgo: number) => new Date(now - minsAgo * 60_000).toISOString();
  
  // Demo user IDs for distant users (anonymous chats)
  const alexNycId = '593b0116-77e5-44de-8af6-c1e6c294a5eb';
  const emmaLondonId = '911111bd-8c47-45e9-a814-00f42b938137';
  
  // Get some nearby users for normal chats
  const { data: nearbyUsers, error: nearbyError } = await supabase
    .from('profiles')
    .select('id')
    .neq('id', currentUserId)
    .limit(2);
  
  if (nearbyError) return { error: nearbyError.message };
  
  const results = [];
  
  // 1. Create conversation with Alex NYC (Anonymous)
  const alexConversationExists = await supabase
    .from('messages')
    .select('id')
    .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${alexNycId}),and(sender_id.eq.${alexNycId},receiver_id.eq.${currentUserId})`)
    .limit(1);
    
  if (!alexConversationExists.error && (!alexConversationExists.data || alexConversationExists.data.length === 0)) {
    const alexMessages = [
      { sender_id: alexNycId, receiver_id: currentUserId, text: 'Hey! I\'m visiting from NYC. Any good coffee spots around here?', sent_at: iso(120), is_read: true },
      { sender_id: currentUserId, receiver_id: alexNycId, text: 'Welcome! There\'s a great place called Blue Bottle just down the street.', sent_at: iso(118), is_read: true },
      { sender_id: alexNycId, receiver_id: currentUserId, text: 'Perfect! Thanks for the recommendation 😊', sent_at: iso(115), is_read: true },
      { sender_id: currentUserId, receiver_id: alexNycId, text: 'No problem! Enjoy your visit!', sent_at: iso(110), is_read: false },
      { sender_id: alexNycId, receiver_id: currentUserId, text: 'This city is amazing! Any other must-see places?', sent_at: iso(30), is_read: false },
    ];
    
    const { error: alexError } = await supabase.from('messages').insert(alexMessages);
    if (alexError) return { error: alexError.message };
    results.push({ type: 'anonymous', userId: alexNycId, name: 'Alex NYC' });
  }
  
  // 2. Create conversation with Emma London (Anonymous)
  const emmaConversationExists = await supabase
    .from('messages')
    .select('id')
    .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${emmaLondonId}),and(sender_id.eq.${emmaLondonId},receiver_id.eq.${currentUserId})`)
    .limit(1);
    
  if (!emmaConversationExists.error && (!emmaConversationExists.data || emmaConversationExists.data.length === 0)) {
    const emmaMessages = [
      { sender_id: emmaLondonId, receiver_id: currentUserId, text: 'Hello from London! 🇬🇧', sent_at: iso(180), is_read: true },
      { sender_id: currentUserId, receiver_id: emmaLondonId, text: 'Hi there! How\'s the weather in London?', sent_at: iso(175), is_read: true },
      { sender_id: emmaLondonId, receiver_id: currentUserId, text: 'Typical London weather - a bit rainy but cozy! ☔', sent_at: iso(170), is_read: true },
      { sender_id: currentUserId, receiver_id: emmaLondonId, text: 'Sounds lovely! I love rainy days.', sent_at: iso(165), is_read: true },
      { sender_id: emmaLondonId, receiver_id: currentUserId, text: 'Same here! Perfect for tea and art projects 🎨', sent_at: iso(45), is_read: false },
      { sender_id: currentUserId, receiver_id: emmaLondonId, text: 'That sounds wonderful! What kind of art do you create?', sent_at: iso(40), is_read: false },
    ];
    
    const { error: emmaError } = await supabase.from('messages').insert(emmaMessages);
    if (emmaError) return { error: emmaError.message };
    results.push({ type: 'anonymous', userId: emmaLondonId, name: 'Emma London' });
  }
  
  // 3. Create conversations with nearby users (Normal chats)
  if (nearbyUsers && nearbyUsers.length > 0) {
    for (let i = 0; i < Math.min(2, nearbyUsers.length); i++) {
      const nearbyUserId = nearbyUsers[i].id;
      
      const nearbyConversationExists = await supabase
        .from('messages')
        .select('id')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${nearbyUserId}),and(sender_id.eq.${nearbyUserId},receiver_id.eq.${currentUserId})`)
        .limit(1);
        
      if (!nearbyConversationExists.error && (!nearbyConversationExists.data || nearbyConversationExists.data.length === 0)) {
        const nearbyMessages = [
          { sender_id: nearbyUserId, receiver_id: currentUserId, text: 'Hey! I saw you on the radar. Want to grab lunch?', sent_at: iso(90), is_read: true },
          { sender_id: currentUserId, receiver_id: nearbyUserId, text: 'Sure! I know a great place nearby.', sent_at: iso(85), is_read: true },
          { sender_id: nearbyUserId, receiver_id: currentUserId, text: 'Awesome! What time works for you?', sent_at: iso(80), is_read: true },
          { sender_id: currentUserId, receiver_id: nearbyUserId, text: 'How about 1 PM?', sent_at: iso(75), is_read: false },
          { sender_id: nearbyUserId, receiver_id: currentUserId, text: 'Perfect! See you then 👍', sent_at: iso(20), is_read: false },
        ];
        
        const { error: nearbyError } = await supabase.from('messages').insert(nearbyMessages);
        if (!nearbyError) {
          results.push({ type: 'normal', userId: nearbyUserId, name: `Nearby User ${i + 1}` });
        }
      }
    }
  }
  
  return { 
    data: {
      conversations: results,
      totalConversations: results.length,
      anonymousCount: results.filter(r => r.type === 'anonymous').length,
      normalCount: results.filter(r => r.type === 'normal').length
    }
  };
}