import webpush from "web-push";
import { sql } from "./db";
import { SITE_URL } from "./site";

let ready = false;
function setup() {
  if (ready) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(SITE_URL, pub, priv);
  return (ready = true);
}

export const pushConfigured = () => Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

// Siunčia pranešimą visiems prenumeratoriams; grąžina { sent, failed }
export async function notifyAll({ title, body, url = "/" }) {
  if (!setup()) return { sent: 0, failed: 0 };
  const subs = await sql`SELECT endpoint, p256dh, auth FROM push_subs`;
  const payload = JSON.stringify({ title, body, url });
  let sent = 0, failed = 0;
  await Promise.allSettled(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 60 * 60 * 24 });
        sent++;
      } catch (err) {
        failed++;
        if (err?.statusCode === 404 || err?.statusCode === 410) await sql`DELETE FROM push_subs WHERE endpoint = ${s.endpoint}`;
      }
    })
  );
  return { sent, failed };
}
