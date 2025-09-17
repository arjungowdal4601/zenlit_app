export type MsgType = 'text' | 'image' | 'audio' | 'system';
export type ChatKind = 'normal' | 'anonymous';

export interface Chat {
  id: string;
  kind: ChatKind;
  title?: string;
  avatar?: string;
  last: string;
  time: string;
  unread?: number;
  muted?: boolean;
  pinned?: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: 'me' | string;
  type: MsgType;
  text?: string;
  mediaUrl?: string;
  replyToId?: string;
  createdAt: string;
  status?: 'sent' | 'delivered' | 'read';
  deleted?: boolean;
}

export const formatTime = (d: Date) => {
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const h12 = hours % 12 || 12;
  const ampm = hours < 12 ? 'AM' : 'PM';
  return `${h12}:${minutes} ${ampm}`;
};

export const dayLabel = (d: Date) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const groupByDay = (messages: Message[]) => {
  const groups: { label: string; items: Message[] }[] = [];
  const byLabel: Record<string, Message[]> = {};

  messages.forEach((message) => {
    const label = dayLabel(new Date(message.createdAt));
    if (!byLabel[label]) byLabel[label] = [];
    byLabel[label].push(message);
  });

  Object.keys(byLabel).forEach((label) => {
    const items = byLabel[label].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    groups.push({ label, items });
  });

  return groups.sort((a, b) => {
    const firstA = new Date(a.items[0].createdAt).getTime();
    const firstB = new Date(b.items[0].createdAt).getTime();
    return firstA - firstB;
  });
};

export const normalSeedChats: Chat[] = [
  {
    id: 'c1',
    kind: 'normal',
    title: 'Alex Johnson',
    avatar: 'https://ui-avatars.com/api/?name=Alex+J&background=111827&color=fff',
    last: 'See you at the cafe!',
    time: '2:45 PM',
    unread: 2,
    pinned: true,
  },
  {
    id: 'c2',
    kind: 'normal',
    title: 'Sarah Chen',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+C&background=111827&color=fff',
    last: 'Just sent the files.',
    time: '1:18 PM',
  },
  {
    id: 'c3',
    kind: 'normal',
    title: 'Mike Rodriguez',
    avatar: 'https://ui-avatars.com/api/?name=Mike+R&background=111827&color=fff',
    last: 'Got it, thanks!',
    time: '12:02 PM',
    muted: true,
  },
  {
    id: 'c4',
    kind: 'normal',
    title: 'Emma Wilson',
    avatar: 'https://ui-avatars.com/api/?name=Emma+W&background=111827&color=fff',
    last: 'That sounds great!',
    time: 'Yesterday',
  },
  {
    id: 'c5',
    kind: 'normal',
    title: 'David Kim',
    avatar: 'https://ui-avatars.com/api/?name=David+K&background=111827&color=fff',
    last: "I'll check tonight.",
    time: 'Tue',
  },
  {
    id: 'c6',
    kind: 'normal',
    title: 'Lisa Thompson',
    avatar: 'https://ui-avatars.com/api/?name=Lisa+T&background=111827&color=fff',
    last: 'Amazing view!',
    time: 'Mon',
  },
  {
    id: 'c7',
    kind: 'normal',
    title: 'Marcus R.',
    avatar: 'https://ui-avatars.com/api/?name=Marcus+R&background=111827&color=fff',
    last: 'On my way now.',
    time: 'Sun',
  },
  {
    id: 'c8',
    kind: 'normal',
    title: 'Product Team',
    avatar: 'https://ui-avatars.com/api/?name=PT&background=111827&color=fff',
    last: 'Meeting moved to 4 PM',
    time: 'Sat',
    unread: 4,
  },
];

export const anonymousSeedChats: Chat[] = [
  { id: 'a1', kind: 'anonymous', last: 'Thanks for the help!', time: '1:07 PM' },
  { id: 'a2', kind: 'anonymous', last: 'Can we keep this anonymous?', time: 'Yesterday' },
  { id: 'a3', kind: 'anonymous', last: 'Read-only sample thread.', time: 'Mon' },
];

export const allSeedChats: Chat[] = [...normalSeedChats, ...anonymousSeedChats];

const buildSeedMessages = (): Message[] => {
  const now = Date.now();
  const minutesAgo = (offset: number) => new Date(now - offset * 60_000).toISOString();

  const base: Message[] = [
    { id: 'm1', chatId: 'c1', senderId: 'c1', type: 'text', text: 'Hey! Reaching the cafe in ten.', createdAt: minutesAgo(300) },
    { id: 'm2', chatId: 'c1', senderId: 'me', type: 'text', text: 'Perfect, see you soon!', createdAt: minutesAgo(290), status: 'delivered' },
    { id: 'm3', chatId: 'c1', senderId: 'c1', type: 'image', mediaUrl: '/next.svg', text: 'Menu looks nice', createdAt: minutesAgo(285) },

    { id: 'm4', chatId: 'c2', senderId: 'c2', type: 'text', text: 'Sent the files.', createdAt: minutesAgo(200) },
    { id: 'm5', chatId: 'c2', senderId: 'me', type: 'text', text: 'Received, thanks!', createdAt: minutesAgo(195), status: 'read' },

    { id: 'm6', chatId: 'c3', senderId: 'me', type: 'text', text: 'All good?', createdAt: minutesAgo(600), status: 'sent' },
    { id: 'm7', chatId: 'c3', senderId: 'c3', type: 'text', text: 'Yep, all set.', createdAt: minutesAgo(580) },

    { id: 'm8', chatId: 'c4', senderId: 'c4', type: 'text', text: 'That sounds great!', createdAt: minutesAgo(1440) },
    { id: 'm9', chatId: 'c4', senderId: 'me', type: 'image', mediaUrl: '/vercel.svg', text: 'Look at this!', createdAt: minutesAgo(1439), status: 'delivered' },

    { id: 'm10', chatId: 'c5', senderId: 'me', type: 'text', text: "I'll check tonight.", createdAt: minutesAgo(3000) },

    { id: 'm11', chatId: 'c6', senderId: 'c6', type: 'text', text: 'Amazing view!', createdAt: minutesAgo(3200) },
    { id: 'm12', chatId: 'c6', senderId: 'me', type: 'text', text: 'Wow, that looks incredible.', createdAt: minutesAgo(3195), status: 'read' },

    { id: 'm13', chatId: 'c7', senderId: 'c7', type: 'audio', text: 'Voice note', createdAt: minutesAgo(5000) },
    { id: 'm14', chatId: 'c7', senderId: 'me', type: 'text', text: 'Got it.', createdAt: minutesAgo(4990) },

    { id: 'm15', chatId: 'c8', senderId: 'c8', type: 'text', text: 'Meeting moved to 4 PM', createdAt: minutesAgo(7000) },
    { id: 'm16', chatId: 'c8', senderId: 'me', type: 'text', text: 'Noted.', createdAt: minutesAgo(6990) },

    { id: 'm17', chatId: 'a1', senderId: 'a1', type: 'text', text: 'Thanks for the help!', createdAt: minutesAgo(60) },
    { id: 'm18', chatId: 'a2', senderId: 'a2', type: 'text', text: 'Can we keep this anonymous?', createdAt: minutesAgo(2880) },
    { id: 'm19', chatId: 'a3', senderId: 'a3', type: 'text', text: 'Read-only sample thread.', createdAt: minutesAgo(4320) },
  ];

  for (let i = 20; i < 36; i += 1) {
    const chatId = i % 2 === 0 ? 'c1' : 'c2';
    base.push({
      id: `m${i}`,
      chatId,
      senderId: i % 3 === 0 ? 'me' : chatId,
      type: 'text',
      text: `Sample message ${i}`,
      createdAt: minutesAgo(8000 - i * 30),
    });
  }

  return base;
};

export const seedMessages = buildSeedMessages();

export const findChatById = (chatId: string) => allSeedChats.find((chat) => chat.id === chatId);

export const getMessagesForChat = (chatId: string) =>
  seedMessages
    .filter((message) => message.chatId === chatId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

export const isAnonymousChat = (chat?: Chat) => chat?.kind === 'anonymous';
