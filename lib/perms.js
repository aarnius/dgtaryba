// Teisės (naudojamos ir serveryje, ir naršyklėje)

// Pagrindinė paskyra: visada turi visas teises, jos negalima pašalinti
export const OWNER_EMAIL = (process.env.NEXT_PUBLIC_OWNER_EMAIL || "arnas@dgg.lt").trim().toLowerCase();

export const PERMS = {
  ideas:     { label: "Idėjos",              hint: "Tvirtinti, slėpti, trinti idėjas" },
  questions: { label: "Klausimai",           hint: "Atsakyti ir trinti klausimus" },
  polls:     { label: "Apklausos",           hint: "Kurti, uždaryti, trinti apklausas" },
  events:    { label: "Renginiai",           hint: "Pridėti ir trinti renginius" },
  page:      { label: "Puslapio redaktorius", hint: "Mygtukai, skelbimai, tekstai" },
  members:   { label: "Vartotojai",          hint: "Pridėti narius ir keisti jų teises" },
};

export const ALL_PERMS = Object.keys(PERMS);
