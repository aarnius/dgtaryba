import { getAuth } from "@/lib/auth/server";

let handlers;
const h = () => (handlers ??= getAuth().handler());

export const GET = (req, ctx) => h().GET(req, ctx);
export const POST = (req, ctx) => h().POST(req, ctx);
