import { redirect } from "next/navigation";
import { getCurrentUser, can } from "@/lib/session";
import { OWNER_EMAIL } from "@/lib/perms";
import { VerifyPanel } from "./AuthForms";
import { signOut } from "@/app/actions";

// Grąžina { user } arba { block: <JSX> }, kurį puslapis turi parodyti vietoj turinio
export async function adminGate(perm) {
  const user = await getCurrentUser();
  if (!user) redirect("/prisijungti");
  if (!user.verified) return { block: <VerifyPanel email={user.email} /> };
  if (perm ? !can(user, perm) : user.perms.length === 0) return { block: <NoAccess user={user} /> };
  return { user };
}

function NoAccess({ user }) {
  return (
    <div className="card empty" style={{ maxWidth: 460, margin: "56px auto" }}>
      <span className="big">🔒</span>
      <h3 style={{ marginTop: 8 }}>Kol kas neturi teisių</h3>
      <p className="muted small" style={{ margin: "0 0 16px" }}>
        Esi prisijungęs kaip <strong style={{ color: "var(--text)" }}>{user.email}</strong>.
        Paprašyk <strong style={{ color: "var(--text)" }}>{OWNER_EMAIL}</strong>, kad suteiktų teises.
      </p>
      <form action={signOut}><button className="btn ghost small">Atsijungti</button></form>
    </div>
  );
}
