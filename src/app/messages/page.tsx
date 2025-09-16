import AppHeader from "@/components/AppHeader";
import AppLayout from "@/components/AppLayout";
import ChatList, { anonymousSeedChats, normalSeedChats } from "@/components/messaging/ChatList";

export const dynamic = "force-dynamic";

export default function MessagesPage() {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4" style={{ fontFamily: 'var(--font-inter)' }}>
        <AppHeader
          title="Messages"
          right={
            <div className="flex items-center gap-2">
              <button className="h-9 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-gray-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">Search</button>
              <button className="h-9 px-3 rounded-xl bg-blue-600 text-white text-xs hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">New</button>
            </div>
          }
        />
        <div className="py-2">
          <ChatList normalChats={normalSeedChats} anonymousChats={anonymousSeedChats} />
        </div>
      </div>
    </AppLayout>
  );
}
