import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { authConfigured } from "@/lib/auth/server";
import { LoginPanel } from "@/components/AuthForms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Prisijungti", robots: { index: false } };

export default async function LoginPage({ searchParams }) {
  if (await getCurrentUser()) redirect("/admin");
  const { klaida } = await searchParams;
  if (!authConfigured()) {
    return <div className="card empty narrow" style={{ maxWidth: 420, margin: "56px auto" }}>Prisijungimas dar nesukonfigūruotas (trūksta NEON_AUTH_* kintamųjų).</div>;
  }
  return <LoginPanel error={klaida ? "Nepavyko prisijungti su Google. Bandyk dar kartą arba naudok el. paštą." : null} />;
}
