"use client";

import AppLayout from "@/components/AppLayout";
import AppHeader from "@/components/AppHeader";
import { useVisibility } from "@/contexts/VisibilityContext";
import { seedComprehensiveConversations } from "@/utils/messagesData";
import { useEffect, useState } from "react";

export default function SeedMessagesPage() {
  const { currentUserId } = useVisibility();
  const [status, setStatus] = useState<string>("Idle");

  useEffect(() => {
    const run = async () => {
      if (!currentUserId) {
        setStatus("Waiting for user session...");
        return;
      }
      setStatus("Seeding comprehensive conversations (anonymous & normal)...");
      const res = await seedComprehensiveConversations(currentUserId);
      if ((res as any)?.error) {
        setStatus(`Error: ${(res as any).error}`);
      } else {
        setStatus(`Seeded conversations with ${(res as any).data.totalConversations} users (${(res as any).data.anonymousCount} anonymous, ${(res as any).data.normalCount} normal). Go to Messages to view.`);
      }
    };
    run();
  }, [currentUserId]);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4">
        <AppHeader title="Seed Messages" />
        <div className="py-8 text-sm text-gray-300">{status}</div>
      </div>
    </AppLayout>
  );
}