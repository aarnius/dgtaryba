import { neon } from "@neondatabase/serverless";
import { SCHEMA } from "./schema.mjs";

let client;
let schemaReady;

function getClient() {
  if (!client) {
    if (!process.env.DATABASE_URL) throw new Error("Trūksta DATABASE_URL");
    client = neon(process.env.DATABASE_URL);
  }
  return client;
}

// Pirmą kartą (kiekvienam serverio paleidimui) sukuria trūkstamas lenteles.
// Visos CREATE TABLE IF NOT EXISTS siunčiamos viena užklausa.
function ensureSchema() {
  if (!schemaReady) {
    const db = getClient();
    schemaReady = db.transaction(SCHEMA.map((s) => db.query(s))).catch((err) => {
      console.error("[taryba] Nepavyko paruošti duomenų bazės. Patikrink DATABASE_URL:", err?.message);
      schemaReady = null; // kitą kartą bandys iš naujo
      throw err;
    });
  }
  return schemaReady;
}

// Tagged template: await sql`SELECT * FROM ideas WHERE id = ${id}`
export async function sql(strings, ...values) {
  await ensureSchema();
  return getClient()(strings, ...values);
}
