import { getSetting, setSetting } from "./content";

export const DEFAULT_TV = {
  headline: "Tavo balsas mokykloje",
  cta: "Siūlyk idėjas, balsuok apklausose ir klausk tarybos anonimiškai",
  url_text: "dgtaryba.lt",
  background_url: null,
  ticker: ["Turi idėją, kaip pagerinti mokyklą? Rašyk dgtaryba.lt", "Sek renginius ir balsuok apklausose telefone"],
  slide_seconds: 12,
  show: { events: true, ideas: true, poll: true, photos: true },
  slides: [],
};

export async function getTv() {
  const v = await getSetting("tv", {});
  return { ...DEFAULT_TV, ...v, show: { ...DEFAULT_TV.show, ...(v.show ?? {}) }, slides: v.slides ?? [] };
}

export const saveTv = (tv) => setSetting("tv", tv);
