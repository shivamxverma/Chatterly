import ChatBase from "@/components/chat/chatBase";
import { fetchChats } from "@/fetch/chatsFetch";
import { fetchChatGroup, fetchChatGroupUsers } from "@/fetch/groupFetch";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Chat({ params }: PageProps) {
  const { id } = await params;

  if (id.length !== 36) return notFound();

  const chatGroup = await fetchChatGroup(id);
  if (!chatGroup) return notFound();

  const [chatGroupUsers, chats] = await Promise.all([
    fetchChatGroupUsers(id),
    fetchChats(id),
  ]);

  return (
    <ChatBase group={chatGroup} users={chatGroupUsers} oldMessages={chats} />
  );
}
