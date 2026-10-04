import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifyAccessToken } from "../../../lib/auth";

const files = new Set(["stanford.webp", "linkedin-summer-2026.webp", "yc-email.webp"]);
export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!files.has(name) || !await verifyAccessToken(token)) {
    return new Response(null, { status: 404, headers: { "Cache-Control": "private, no-store" } });
  }
  const file = await readFile(join(process.cwd(), "assets", "evidence", name));
  return new Response(new Uint8Array(file), {
    headers: { "Content-Type": "image/webp", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
  });
}
