import { getLock, hasPass } from "@/lib/lock";
import { getCurrentUser } from "@/lib/session";
import LockScreen from "@/components/LockScreen";
import ChatWidget from "@/components/ChatWidget";

// Visi vieši puslapiai: jei svetainė užrakinta, rodomas užrakinimo ekranas
export default async function SiteLayout({ children }) {
  const lock = await getLock().catch(() => null);
  const page = <>{children}<ChatWidget /></>;
  if (!lock?.enabled) return page;

  const user = await getCurrentUser();
  if (user?.perms?.length) {
    return (
      <>
        <div className="lock-banner">🔒 Svetainė užrakinta lankytojams. Tu ją matai, nes esi tarybos narys. <a href="/admin/puslapis#uzrakinimas">Valdyti</a></div>
        {page}
      </>
    );
  }
  if (await hasPass(lock)) return page;
  return <LockScreen title={lock.title} message={lock.message} eta={lock.eta} hasPassword={Boolean(lock.hash)} />;
}
