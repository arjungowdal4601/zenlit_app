import AppHeader from "@/components/AppHeader";
import AppLayout from "@/components/AppLayout";
import ChatList, { anonymousSeedChats, normalSeedChats } from "@/components/messaging/ChatList";

export const dynamic = "force-dynamic";

export default function MessagesPage() {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4" style={{ fontFamily: 'var(--font-inter)' }}>
        <AppHeader title="Messages" />
        <div className="py-2">
          <ChatList normalChats={normalSeedChats} anonymousChats={anonymousSeedChats} />
        </div>
      </div>
    </AppLayout>
  );
}
