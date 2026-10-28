"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Ransom from "./Ransom";

const LINKS = [
  { href: "/idejos", label: "Idėjos", emoji: "💡" },
  { href: "/apklausos", label: "Apklausos", emoji: "📊" },
  { href: "/renginiai", label: "Renginiai", emoji: "📅" },
  { href: "/klausimai", label: "Klausimai", emoji: "💬" },
];

export default function Nav({ schoolName }) {
  const path = usePathname();
  return (
    <header className="nav">
      <Link href="/" className="logo">
        <Ransom text={schoolName} as="span" className="xs" seed={3} />
      </Link>
      <nav>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={path.startsWith(l.href) ? "active" : ""}>
            <span aria-hidden>{l.emoji}</span> {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
