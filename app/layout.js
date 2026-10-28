import "./globals.css";
import Nav from "@/components/Nav";

const schoolName = process.env.NEXT_PUBLIC_SCHOOL_NAME || "Mokinių taryba";

export const metadata = {
  title: { default: schoolName, template: `%s · ${schoolName}` },
  description: "Idėjos, apklausos, renginiai ir klausimai mokinių tarybai.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="lt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Sans:wght@400;500;700&family=Playfair+Display:ital,wght@0,700;0,800;1,700;1,800&family=Rubik:wght@800&family=Shrikhand&display=swap"
        />
      </head>
      <body>
        <Nav schoolName={schoolName} />
        <main className="wrap">{children}</main>
        <footer className="footer">
          Sukurta mokinių, mokiniams 💛 · <a href="/admin">Tarybai</a>
        </footer>
      </body>
    </html>
  );
}
