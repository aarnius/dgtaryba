import "./globals.css";
import Nav from "@/components/Nav";
import SwRegister from "@/components/SwRegister";
import { fontVars } from "@/lib/fonts";
import { SCHOOL, SCHOOL_GEN, CONTACT_EMAIL } from "@/lib/site";

import { SITE_URL, SITE_NAME, SITE_SHORT, SITE_DESCRIPTION } from "@/lib/site";

const schoolName = process.env.NEXT_PUBLIC_SCHOOL_NAME || "Mokinių taryba";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s · ${SITE_SHORT}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Dariaus ir Girėno gimnazija", "Dariaus ir Girėno gimnazijos mokinių taryba", "DG mokinių taryba",
    "mokinių taryba", "Kauno Stepono Dariaus ir Stasio Girėno gimnazija", "Kaunas", "dgtaryba",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", locale: "lt_LT", url: "/", siteName: SITE_NAME, title: SITE_NAME, description: SITE_DESCRIPTION,
    images: [{ url: "/koliazas.jpg", width: 2546, height: 1400, alt: SITE_NAME }],
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION, images: ["/koliazas.jpg"] },
  robots: { index: true, follow: true },
  appleWebApp: { capable: true, title: "DG taryba", statusBarStyle: "black-translucent" },
  ...(process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION && { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION } }),
};

export const viewport = { themeColor: "#140e18", colorScheme: "dark" };

export default function RootLayout({ children }) {
  return (
    <html lang="lt" className={fontVars}>
      <body>
        <a href="#turinys" className="skip-link">Pereiti prie turinio</a>
        <SwRegister />
        <Nav schoolName={schoolName} />
        <main className="wrap" id="turinys">{children}</main>
        <footer className="footer">
          <div>Sukurta mokinių, mokiniams 💛 · {SCHOOL_GEN} mokinių taryba · Miško g. 1, Kaunas</div>
          <nav className="footer-links" aria-label="Teisinė informacija">
            <a href="/privatumas">Privatumo politika</a>
            <a href="/privatumas#slapukai">Slapukai</a>
            <a href={`mailto:${CONTACT_EMAIL}`}>Kontaktai</a>
            <a href="/renginiai.ics">Kalendorius</a>
            <a href="/admin">Tarybai</a>
          </nav>
        </footer>
      </body>
    </html>
  );
}
