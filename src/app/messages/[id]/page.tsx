import { notFound } from "next/navigation";
import ChatDetailClient from "./ChatDetailClient";

export const dynamic = "force-dynamic";

type Params = { id: string };

type PageProps = {
  params?: Promise<Params>;
};

export default async function ChatDetailPage({ params }: PageProps) {
  const resolvedParams = params ? await params : null;

  if (!resolvedParams?.id) {
    notFound();
  }

  return <ChatDetailClient chatId={resolvedParams.id} />;
}
