// Sukuria lenteles Neon duomenų bazėje: npm run db:setup
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("Trūksta DATABASE_URL (.env.local faile).");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const schema = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");

const statements = schema
  .split(";")
  .map((s) => s.replace(/--.*$/gm, "").trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
}

// Pavyzdiniai duomenys, kad puslapis nebūtų tuščias
const [{ count }] = await sql`SELECT count(*)::int AS count FROM events`;
if (count === 0) {
  await sql`INSERT INTO events (title, description, location, emoji, starts_at) VALUES
    ('Kalėdinė diskoteka', 'Muzika, šokiai ir slaptas Kalėdų senelis!', 'Aktų salė', '🪩', now() + interval '30 days'),
    ('Talentų šou', 'Užsiregistruok pas tarybą ir parodyk, ką moki.', 'Aktų salė', '🎤', now() + interval '14 days')`;
  const [poll] = await sql`INSERT INTO polls (question) VALUES ('Kokia tema kitai diskotekai?') RETURNING id`;
  await sql`INSERT INTO poll_options (poll_id, label) VALUES
    (${poll.id}, '80-ųjų retro'), (${poll.id}, 'Neoninė'), (${poll.id}, 'Pižamų vakarėlis')`;
  console.log("Pridėti pavyzdiniai renginiai ir apklausa.");
}

console.log("✅ Duomenų bazė paruošta.");
