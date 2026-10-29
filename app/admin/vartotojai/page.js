import Ransom from "@/components/Ransom";
import AdminTabs from "@/components/AdminTabs";
import { adminGate } from "@/components/AdminGate";
import { MemberForm, ConfirmButton } from "@/components/Forms";
import { removeMember } from "@/app/actions";
import { sql } from "@/lib/db";
import { PERMS, OWNER_EMAIL } from "@/lib/perms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vartotojai", robots: { index: false } };

export default async function MembersPage() {
  const { user, block } = await adminGate("members");
  if (block) return block;

  const members = await sql`SELECT * FROM members ORDER BY created_at`;
  const allLabels = Object.keys(PERMS);

  return (
    <>
      <div className="page-head">
        <Ransom text="Vartotojai" className="sm" seed={71} />
        <AdminTabs active="vartotojai" user={user} />
      </div>

      <div className="two-col">
        <div className="members">
          <div className="card member owner">
            <div className="member-head">
              <div className="info">
                <strong>{OWNER_EMAIL}</strong> <span className="tag owner">Savininkas</span>
                <div className="muted small">Visada turi visas teises</div>
              </div>
            </div>
            <div className="perm-chips">{allLabels.map((p) => <span key={p} className="chip on">{PERMS[p].label}</span>)}</div>
          </div>

          {members.length === 0 && (
            <div className="card empty small">Dar nėra pridėtų narių. Pridėk dešinėje →</div>
          )}

          {members.map((m) => {
            const locked = !user.isOwner && m.perms.includes("members");
            return (
              <div key={m.email} className="card member">
                <div className="member-head">
                  <div className="info">
                    <strong>{m.name || m.email}</strong>
                    {m.name && <div className="muted small">{m.email}</div>}
                  </div>
                  {!locked && (
                    <form action={removeMember}>
                      <input type="hidden" name="email" value={m.email} />
                      <ConfirmButton className="icon-btn danger" message={`Pašalinti ${m.email}?`} title="Pašalinti">🗑</ConfirmButton>
                    </form>
                  )}
                </div>
                {locked ? (
                  <div className="perm-chips">{m.perms.map((p) => PERMS[p] && <span key={p} className="chip on">{PERMS[p].label}</span>)}</div>
                ) : (
                  <MemberForm member={m} canGrantMembers={user.isOwner} />
                )}
              </div>
            );
          })}
        </div>

        <aside className="sticky">
          <MemberForm canGrantMembers={user.isOwner} />
          <p className="muted small" style={{ marginTop: 12 }}>
            Narys prisijungia su <strong>tuo pačiu el. paštu</strong> per Google arba užsiregistravęs su slaptažodžiu.
            Teisės įsigalioja iškart, kai jis patvirtina el. paštą.
          </p>
        </aside>
      </div>
    </>
  );
}
