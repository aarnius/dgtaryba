import Ransom from "@/components/Ransom";
import Blocks from "@/components/Blocks";
import { BlockForm, LoginForm } from "@/components/Forms";
import AdminTabs from "@/components/AdminTabs";
import { isAdmin } from "@/lib/session";
import { getBlocks } from "@/lib/queries";
import { PLACES } from "@/lib/blocks";

export const dynamic = "force-dynamic";
export const metadata = { title: "Puslapio redaktorius", robots: { index: false } };

export default async function PageEditor({ searchParams }) {
  if (!(await isAdmin())) return <LoginForm />;

  const { edit } = await searchParams;
  const blocks = await getBlocks({ includeHidden: true });
  const editingId = Number(edit) || null;
  const editing = editingId ? blocks.find((b) => b.id === editingId) : null;

  return (
    <>
      <div className="page-head">
        <Ransom text="Puslapio redaktorius" className="sm" seed={61} />
        <AdminTabs active="puslapis" />
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
    </>
  );
}
