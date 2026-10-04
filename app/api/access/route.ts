import { NextRequest, NextResponse } from "next/server";
import { checkPassword, createAccessToken, COOKIE_NAME, TOKEN_LIFETIME_SECONDS } from "@/lib/auth";
import { recordVisit } from "@/lib/visits";
import { after } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) return new NextResponse(null, { status: 415 });
  const body = await request.text();
  if (body.length > 512) return new NextResponse(null, { status: 413 });
  let password: unknown;
  let acknowledged: unknown;
  try { ({ password, acknowledged } = JSON.parse(body)); } catch { return new NextResponse(null, { status: 400 }); }
  if (typeof password !== "string") return new NextResponse(null, { status: 400 });
  if (acknowledged !== true) return new NextResponse(null, { status: 400 });
  if (!await checkPassword(password)) return new NextResponse(null, { status: 401, headers: { "Cache-Control": "no-store" } });
  const token = await createAccessToken();
  if (!token) return new NextResponse(null, { status: 503 });
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(COOKIE_NAME, token, { httpOnly: true, secure: request.nextUrl.protocol === "https:", sameSite: "lax", path: "/", maxAge: TOKEN_LIFETIME_SECONDS });
  after(async () => {
    try { await recordVisit(request, true); }
    catch { console.error("Could not record portfolio unlock."); }
  });
  return response;
}
