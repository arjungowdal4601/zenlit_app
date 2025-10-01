"use client";

import AppHeader from "@/components/AppHeader";
import AppLayout from "@/components/AppLayout";
import ChatList from "@/components/messaging/ChatList";
import type { Chat } from "@/components/messaging/data";
import { useEffect, useState } from "react";
import { useVisibility } from "@/contexts/VisibilityContext";
import { getNearbyUsers } from "@/utils/locationService";
import { getChatsForUser } from "@/utils/messagesData";

export const dynamic = "force-dynamic";

export default function MessagesPage() {
  const { currentUserId, locationData } = useVisibility();
  const [normalChats, setNormalChats] = useState<Chat[]>([]);
  const [anonymousChats, setAnonymousChats] = useState<Chat[]>([]);

  useEffect(() => {
    const run = async () => {
      if (!currentUserId) return;
      try {
        let nearbyIds: string[] = [];
        if (locationData?.lat_short != null && locationData?.long_short != null) {
          const nearby = await getNearbyUsers(currentUserId, Number(locationData.lat_short), Number(locationData.long_short));
          nearbyIds = (nearby || []).map((u: any) => u.id);
        }
        const res = await getChatsForUser(currentUserId, nearbyIds);
        setNormalChats(res.normalChats);
        setAnonymousChats(res.anonymousChats);
      } catch (e) {
        console.error('Failed to load chats', e);
      }
    };
    run();
  }, [currentUserId, locationData?.lat_short, locationData?.long_short]);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4">
        <AppHeader title="Messages" />
        <div className="py-2">
          <ChatList normalChats={normalChats} anonymousChats={anonymousChats} />
        </div>
      </div>
    </AppLayout>
  );
}
