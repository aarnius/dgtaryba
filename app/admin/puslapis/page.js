import Ransom from "@/components/Ransom";
import Blocks from "@/components/Blocks";
import { BlockForm } from "@/components/Forms";
import { adminGate } from "@/components/AdminGate";
import AdminTabs from "@/components/AdminTabs";
import { getBlocks } from "@/lib/queries";
import { PLACES } from "@/lib/blocks";
import { ActionForm } from "@/components/MediaForms";
import { getBells } from "@/lib/content";
import { formatBells } from "@/lib/bells";
import { saveBells, sendNotification } from "@/app/content-actions";
import { pushConfigured } from "@/lib/push";
import { sql } from "@/lib/db";
import { getLock } from "@/lib/lock";
import { LockSettingsForm } from "@/components/LockForms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Puslapio redaktorius", robots: { index: false } };

export default async function PageEditor({ searchParams }) {
  const { user, block } = await adminGate("page");
  if (block) return block;

  const { edit } = await searchParams;
  const [blocks, bells, [{ subs }], lock] = await Promise.all([
    getBlocks({ includeHidden: true }), getBells(), sql`SELECT count(*)::int AS subs FROM push_subs`, getLock(),
  ]);
  const editingId = Number(edit) || null;
  const editing = editingId ? blocks.find((b) => b.id === editingId) : null;

  return (
    <>
      <div className="page-head">
        <Ransom text="Puslapio redaktorius" className="sm" seed={61} />
        <AdminTabs active="puslapis" user={user} />
      </div>

      <div className="two-col editor">
        <div>
          {Object.entries(PLACES).map(([place, name]) => {
            const list = blocks.filter((b) => b.place === place);
            return (
              <section key={place} className="admin-section" style={{ marginTop: 0 }}>
                <h2>{name} <span className="tag">{list.length}</span></h2>
                {list.length === 0 ? (
                  <div className="card empty small">Čia dar nieko nėra. Pridėk bloką dešinėje →</div>
                ) : (
                  <Blocks blocks={list} editable editingId={editingId} />
                )}
              </section>
            );
          })}
          <p className="muted small">
            Pakeitimai iškart matomi <a href="/" className="section-link" style={{ margin: 0 }}>pagrindiniame puslapyje</a>.
          </p>
        </div>

        <aside className="sticky">
          {/* key: kai keičiam redaguojamą bloką, forma persikrauna su naujom reikšmėm */}
          <BlockForm key={editing?.id ?? "new"} block={editing ?? null} />
        </aside>
      </div>

      <div className="two-equal" style={{ marginTop: 40 }}>
        <section className="admin-section" style={{ margin: 0 }}>
          <h2>🔔 Pamokų laikas</h2>
          <ActionForm action={saveBells} submit="Išsaugoti tvarkaraštį">
            <label className="field"><span>Po vieną pamoką eilutėje: numeris pradžia-pabaiga</span>
              <textarea name="bells" rows={9} className="mono" defaultValue={formatBells(bells)} />
            </label>
            <small className="muted">Pagal nutylėjimą paimta iš dgg.lt. Pagrindiniame puslapyje rodomas laikmatis „iki skambučio“.</small>
          </ActionForm>
        </section>
        <section className="admin-section" style={{ margin: 0 }}>
          <h2>📣 Siųsti pranešimą <span className="tag">{subs} gavėjų</span></h2>
          {pushConfigured() ? (
            <ActionForm action={sendNotification} submit="Siųsti visiems">
              <label className="field"><span>Pavadinimas</span><input name="title" required maxLength={80} placeholder="🎟️ Bilietai jau parduodami!" /></label>
              <label className="field"><span>Tekstas</span><input name="body" maxLength={200} placeholder="Ilgosios pertraukos metu prie valgyklos" /></label>
              <label className="field"><span>Kur nuves paspaudus</span><input name="url" maxLength={200} defaultValue="/" placeholder="/renginiai" /></label>
              <small className="muted">Gauna tie, kurie paspaudė „🔔 Gauti pranešimus". Naujos apklausos ir renginiai praneša patys.</small>
            </ActionForm>
          ) : (
            <div className="card empty small">Pranešimai dar nesukonfigūruoti</div>
          )}
        </section>
      </div>

      <section className="admin-section">
        <h2>🔒 Puslapio užrakinimas {lock.enabled ? <span className="tag pending">Užrakinta</span> : <span className="tag done">Atrakinta</span>}</h2>
        <div className="two-col">
          <LockSettingsForm lock={lock} />
          <p className="muted small">Kai užrakinta, visi vieši puslapiai rodo atnaujinimo pranešimą (kaip dgg.lt), o apačioje yra slaptažodžio laukelis. Admin ir prisijungimas veikia visada.</p>
        </div>
      </section>
    </>
  );
}
