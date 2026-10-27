import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, createAccessToken, TOKEN_LIFETIME_SECONDS } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Reviewer link: issue the same portfolio session used by the password flow.
// This deliberately skips the gate, including its acknowledgement checkbox.
// Owner-only visit administration continues to require its separate owner key.
export async function GET(request: NextRequest) {
  const token = await createAccessToken();
  const headers = {
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
    "Referrer-Policy": "no-referrer",
  };
  if (!token) return new NextResponse("Portfolio access is temporarily unavailable.", { status: 503, headers });
  const response = NextResponse.redirect(new URL("/", request.url), { status: 303, headers });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_LIFETIME_SECONDS,
  });
  return response;
}
