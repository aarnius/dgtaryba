import Ransom from "@/components/Ransom";
import AdminTabs from "@/components/AdminTabs";
import ChatAdmin from "@/components/ChatAdmin";
import { adminGate } from "@/components/AdminGate";
import { adminThreads } from "@/app/chat-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pokalbiai", robots: { index: false } };

export default async function ChatsPage() {
  const { user, block } = await adminGate("questions");
  if (block) return block;
  const threads = await adminThreads();
  return (
    <>
      <div className="page-head">
        <Ransom text="Pokalbiai" className="sm" seed={33} />
        <AdminTabs active="pokalbiai" user={user} />
      </div>
      <ChatAdmin initialThreads={threads} />
    </>
  );
}
