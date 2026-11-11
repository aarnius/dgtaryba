import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

export default function manifest() {
  return {
    name: SITE_NAME,
    short_name: "DG taryba",
    description: SITE_DESCRIPTION,
    lang: "lt",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#140e18",
    theme_color: "#140e18",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Renginiai / Įvykiai", url: "/renginiai" },
      { name: "Idėjos", url: "/idejos" },
      { name: "Apklausos", url: "/apklausos" },
    ],
  };
}
