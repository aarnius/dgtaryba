// Viena vieta svetainės pavadinimams ir adresui (SEO)
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://dgtaryba.lt").replace(/\/$/, "");
export const SCHOOL = "Kauno Stepono Dariaus ir Stasio Girėno gimnazija";
export const SITE_NAME = "Dariaus ir Girėno gimnazijos mokinių taryba";
export const SITE_SHORT = "DG mokinių taryba";
export const SITE_DESCRIPTION =
  "Kauno Stepono Dariaus ir Stasio Girėno gimnazijos mokinių taryba: idėjos mokyklai, apklausos, renginiai ir anoniminiai klausimai tarybai.";

// Kontaktas privatumo klausimams (gali pakeisti Vercel kintamuoju NEXT_PUBLIC_CONTACT_EMAIL)
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || process.env.NEXT_PUBLIC_OWNER_EMAIL || "arnas@dgg.lt";
export const SCHOOL_GEN = "Kauno Stepono Dariaus ir Stasio Girėno gimnazijos";
