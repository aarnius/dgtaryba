import { neon } from "@neondatabase/serverless";

let client;

// Tagged template: await sql`SELECT * FROM ideas WHERE id = ${id}`
export function sql(strings, ...values) {
  if (!client) {
    if (!process.env.DATABASE_URL) throw new Error("Trūksta DATABASE_URL");
    client = neon(process.env.DATABASE_URL);
  }
  return client(strings, ...values);
}
