import { createNeonAuth } from "@neondatabase/auth/next/server";

let instance;

// Kuriam tik kai reikia, kad be NEON_AUTH_* kintamųjų viešas puslapis vis tiek veiktų
export function getAuth() {
  if (!instance) {
    const baseUrl = process.env.NEON_AUTH_BASE_URL;
    const secret = process.env.NEON_AUTH_COOKIE_SECRET;
    if (!baseUrl || !secret) throw new Error("Trūksta NEON_AUTH_BASE_URL arba NEON_AUTH_COOKIE_SECRET");
    instance = createNeonAuth({ baseUrl, cookies: { secret, sameSite: "lax" } });
  }
  return instance;
}

export const authConfigured = () => Boolean(process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET);
