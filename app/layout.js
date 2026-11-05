import "./globals.css";
import Nav from "@/components/Nav";
import SwRegister from "@/components/SwRegister";

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
    <html lang="lt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Figtree:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&family=Playfair+Display:ital,wght@0,700;0,800;1,700;1,800&family=Rubik:wght@800&family=Shrikhand&display=swap"
        />
      </head>
      <body>
        <SwRegister />
        <Nav schoolName={schoolName} />
        <main className="wrap">{children}</main>
        <footer className="footer">
          Sukurta mokinių, mokiniams 💛 · <a href="/renginiai.ics">Kalendorius</a> · <a href="/admin">Tarybai</a>
        </footer>
      </body>
    </html>
  );
}
