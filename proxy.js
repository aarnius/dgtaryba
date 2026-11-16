import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/server";
import { readToken } from "@/lib/webauthn";

// Atnaujina sesiją ir neprisijungusius iš /admin nukreipia į prisijungimą.
// Prisijungusius su passkey praleidžiam (tikra patikra vyksta puslapyje per getCurrentUser).
export default function proxy(req) {
  const pk = req.cookies.get("dg_pk")?.value;
  const secret = process.env.NEON_AUTH_COOKIE_SECRET;
  if (pk && secret && readToken(secret, "sess", pk)) return NextResponse.next();
  return getAuth().middleware({ loginUrl: "/prisijungti" })(req);
}

export const config = {
  matcher: ["/admin/:path*"],
};
