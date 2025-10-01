"use client";

import { useMemo, useState, useEffect } from "react";
import AppLayout from "../../../components/AppLayout";
import ChatHeader from "../../../components/messaging/ChatHeader";
import DayDivider from "../../../components/messaging/DayDivider";
import MessageBubble from "../../../components/messaging/MessageBubble";
import Composer from "@/components/messaging/Composer";
import {
  // findChatById,
  // getMessagesForChat,
  groupByDay,
  // isAnonymousChat,
  type Message,
} from "@/components/messaging/data";
import { useVisibility } from "@/contexts/VisibilityContext";
import { getNearbyUsers } from "@/utils/locationService";
import { getMessagesBetweenUsers, sendTextMessage } from "@/utils/messagesData";

interface ChatDetailClientProps {
  chatId: string; // other participant user id
}

export default function ChatDetailClient({ chatId }: ChatDetailClientProps) {
  const { currentUserId, locationData } = useVisibility();
  const [messages, setMessages] = useState<Message[]>([]);
  const [anonymous, setAnonymous] = useState<boolean>(true);
  const [title, setTitle] = useState<string>("Anonymous");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const init = async () => {
      if (!currentUserId) return;
      // Load messages between current user and other user
      try {
        const rows = await getMessagesBetweenUsers(currentUserId, chatId);
        setMessages(rows);
      } catch (e) {
        console.error('Failed to fetch messages', e);
      }

      // Determine proximity -> anonymous or normal, and fetch profile if nearby
      try {
        let nearby = [] as any[];
        if (locationData?.lat_short != null && locationData?.long_short != null) {
          nearby = await getNearbyUsers(currentUserId, Number(locationData.lat_short), Number(locationData.long_short));
        }
        const isNearby = (nearby || []).some((u: any) => u.id === chatId);
        setAnonymous(!isNearby);
        if (isNearby) {
          // Use nearby array data to set title & avatar
          const user = (nearby || []).find((u: any) => u.id === chatId);
          const display = user?.profiles?.display_name ?? 'Nearby user';
          const avatar = user?.profiles?.social_links?.profile_pic_url ?? undefined;
          setTitle(display);
          setAvatarUrl(avatar);
        } else {
          setTitle('Anonymous');
          setAvatarUrl(undefined);
        }
      } catch (e) {
        console.error('Failed to determine proximity', e);
      }
    };
    init();
  }, [currentUserId, chatId, locationData?.lat_short, locationData?.long_short]);

  const groups = useMemo(() => groupByDay(messages), [messages]);

  const handleSend = async (text: string) => {
    if (!currentUserId || anonymous) return;
    const res = await sendTextMessage(currentUserId, chatId, text);
    if (res.error) {
      console.error('Send message error:', res.error);
      return;
    }
    // Optimistically append
    setMessages((prev) => [
      ...prev,
      {
        id: res.data.id,
        chatId,
        senderId: 'me',
        type: 'text',
        text,
        createdAt: res.data.sent_at,
        status: 'sent',
      },
    ]);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <ChatHeader
          title={title}
          subtitle={undefined}
          avatarUrl={avatarUrl}
          anonymous={anonymous}
        />

        {/* Conversation */}
        <div className="px-4 py-3 space-y-4 pb-24">
          {groups.map((group) => (
            <div key={group.label}>
              <DayDivider label={group.label} />
              <div className="flex flex-col gap-2">
                {group.items.filter((m) => !anonymous || m.type === 'text').map((m) => {
                  const repliedTo = m.replyToId
                    ? messages.find((x) => x.id === m.replyToId)
                    : undefined;
                  const isMe = m.senderId === "me";
                  return (
                    <MessageBubble key={m.id} message={m} isMe={isMe} repliedTo={repliedTo} />
                  );
                })}
              </div>
            </div>
          ))}

          {groups.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-10">
              No messages yet. Say hi!
            </div>
          )}
        </div>

        {/* Composer disabled when anonymous */}
        <Composer onSend={handleSend} disabled={anonymous} />
      </div>
    </AppLayout>
  );
}
