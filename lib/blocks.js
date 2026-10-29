// Bendri puslapio redaktoriaus nustatymai (naudojami ir serveryje, ir naršyklėje)

export const KINDS = {
  button:  { label: "Mygtukas",  emoji: "🔘", fields: ["title", "url", "color"], hint: "Didelis spalvotas mygtukas su nuoroda (pvz. registracija, Instagram)." },
  banner:  { label: "Skelbimų juosta", emoji: "📢", fields: ["title", "url", "color"], hint: "Ryški juosta per visą plotį. Nuoroda nebūtina." },
  heading: { label: "Antraštė",  emoji: "✂️", fields: ["title"], hint: "Didelė antraštė iškarpų raidėmis." },
  text:    { label: "Tekstas",   emoji: "📝", fields: ["title", "body"], hint: "Kortelė su tekstu. Pavadinimas nebūtinas." },
  image:   { label: "Nuotrauka", emoji: "🖼️", fields: ["url", "title"], hint: "Nuotraukos adresas (https://…) ir parašas po ja." },
};

export const PLACES = {
  top: "Viršuje (virš koliažo)",
  bottom: "Po plytelėmis",
};

export const COLORS = {
  mustard: "Geltona",
  wine: "Vyšninė",
  rose: "Rožinė",
  orange: "Oranžinė",
  green: "Žalia",
  blue: "Mėlyna",
  gray: "Pilka",
};

// Leidžiam tik https://, http:// ir vidinius kelius (/renginiai). Jokių javascript: ir pan.
export function cleanUrl(raw) {
  const url = String(raw ?? "").trim().slice(0, 500);
  if (!url) return "";
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/|$)/i.test(url)) return `https://${url}`; // „instagram.com/x“ → https://
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
  } catch {
    return null;
  }
}

export const isExternal = (url) => /^https?:\/\//i.test(url ?? "");
