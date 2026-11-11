import { signOut } from "@/app/actions";
import { can } from "@/lib/session";

const TABS = [
  { id: "pultas", href: "/admin", label: "🎛️ Pultas", show: (u) => u.perms.some((p) => ["ideas", "questions", "polls", "events"].includes(p)) },
  { id: "pokalbiai", href: "/admin/pokalbiai", label: "💬 Pokalbiai", show: (u) => can(u, "questions") },
  { id: "puslapis", href: "/admin/puslapis", label: "✏️ Puslapio redaktorius", show: (u) => can(u, "page") },
  { id: "tv", href: "/admin/tv", label: "📺 TV", show: (u) => can(u, "tv") },
  { id: "taryba", href: "/admin/taryba", label: "🏛️ Taryba", show: (u) => can(u, "council") },
  { id: "galerija", href: "/admin/galerija", label: "📸 Galerija", show: (u) => can(u, "council") },
  { id: "vartotojai", href: "/admin/vartotojai", label: "👥 Vartotojai", show: (u) => can(u, "members") },
];

export default function AdminTabs({ active, user }) {
  return (
    <div className="admin-tabs">
      <nav>
        {TABS.filter((t) => t.show(user)).map((t) => (
          <a key={t.id} href={t.href} className={t.id === active ? "active" : ""}>{t.label}</a>
        ))}
      </nav>
      <div className="who">
        {user.image && <img src={user.image} alt="" width={26} height={26} />}
        <span className="small">{user.email}{user.isOwner && <span className="tag owner">Savininkas</span>}</span>
        <form action={signOut}><button className="btn ghost small">Atsijungti</button></form>
      </div>
    </div>
  );
}
