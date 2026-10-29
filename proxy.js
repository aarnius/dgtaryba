import { getAuth } from "@/lib/auth/server";

// Atnaujina sesiją ir neprisijungusius iš /admin nukreipia į prisijungimą
export default function proxy(req) {
  return getAuth().middleware({ loginUrl: "/prisijungti" })(req);
}

export const config = {
  matcher: ["/admin/:path*"],
};
