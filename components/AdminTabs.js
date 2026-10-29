import { logout } from "@/app/actions";

const TABS = [
  { id: "pultas", href: "/admin", label: "🎛️ Pultas" },
  { id: "puslapis", href: "/admin/puslapis", label: "✏️ Puslapio redaktorius" },
];

export default function AdminTabs({ active }) {
  return (
    <div className="admin-tabs">
      <nav>
        {TABS.map((t) => (
          <a key={t.id} href={t.href} className={t.id === active ? "active" : ""}>{t.label}</a>
        ))}
      </nav>
      <form action={logout}><button className="btn ghost small">Atsijungti</button></form>
    </div>
  );
}
