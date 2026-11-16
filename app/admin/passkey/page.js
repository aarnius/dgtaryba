import { redirect } from "next/navigation";
import Ransom from "@/components/Ransom";
import AdminTabs from "@/components/AdminTabs";
import { VerifyPanel } from "@/components/AuthForms";
import { AddPasskey } from "@/components/Passkey";
import { ConfirmButton } from "@/components/Forms";
import { getCurrentUser } from "@/lib/session";
import { passkeySessionId } from "@/lib/passkey";
import { deletePasskey } from "@/app/passkey-actions";
import { sql } from "@/lib/db";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Passkey", robots: { index: false } };

export default async function PasskeyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/prisijungti");
  if (!user.verified) return <VerifyPanel email={user.email} />;

  const [keys, current] = await Promise.all([
    sql`SELECT id, name, created_at, last_used_at FROM passkeys WHERE email = ${user.email} ORDER BY created_at`,
    passkeySessionId(),
  ]);

  return (
    <>
      <div className="page-head">
        <Ransom text="Passkey" className="sm" seed={83} />
        <AdminTabs active="passkey" user={user} />
      </div>

      <div className="two-col">
        <section className="admin-section" style={{ marginTop: 0 }}>
          <h2>🔑 Mano passkey <span className="tag">{keys.length}</span></h2>
          <div className="card">
            {keys.length === 0 && <p className="muted" style={{ margin: 0 }}>Dar nesukūrei nė vieno. Sukurk dešinėje →</p>}
            {keys.map((k) => (
              <div key={k.id} className="admin-row">
                <div className="info">
                  <strong>{k.name}</strong>{k.id === current && <span className="tag done" style={{ marginLeft: 8 }}>Šis prisijungimas</span>}
                  <p className="muted small" style={{ margin: 0 }}>
                    Sukurta {timeAgo(k.created_at)} · {k.last_used_at ? `naudota ${timeAgo(k.last_used_at)}` : "dar nenaudota"}
                  </p>
                </div>
                <form action={deletePasskey}>
                  <input type="hidden" name="id" value={k.id} />
                  <ConfirmButton className="btn danger small" message={`Ištrinti passkey „${k.name}“? Su juo nebegalėsi prisijungti.`}>Ištrinti</ConfirmButton>
                </form>
              </div>
            ))}
          </div>
        </section>

        <aside className="card form">
          <h3>Naujas passkey</h3>
          <p className="muted small" style={{ margin: 0 }}>
            Passkey leidžia prisijungti be slaptažodžio: piršto atspaudu, veidu (Face ID, Windows Hello) arba
            kompiuterio PIN. Sukurk jį kiekviename įrenginyje, kuriame jungiesi. Telefone sukurtas passkey per
            iCloud ar Google dažnai veikia ir kituose tavo įrenginiuose.
          </p>
          <AddPasskey />
          <small className="muted">Biometrija niekada nepalieka tavo įrenginio: svetainė gauna tik patvirtinimą.</small>
        </aside>
      </div>
    </>
  );
}
