import { get, list, put } from "@vercel/blob";
import type { NextRequest } from "next/server";

// Private log of successful unlocks where the visitor ticked the acknowledgement box.
// Each entry is one private JSON blob under visits/; only the owner page reads them.

export type Visit = {
  at: string;
  city: string;
  region: string;
  country: string;
  device: string;
  userAgent: string;
  acknowledged: boolean;
};

function describeDevice(ua: string) {
  const os = /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) ? "iPad" : /Android/.test(ua) ? "Android" : /Mac OS X/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : /CrOS/.test(ua) ? "Chromebook" : /Linux/.test(ua) ? "Linux" : "Unknown device";
  const browser = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Unknown browser";
  return `${os}, ${browser}`;
}

const header = (request: NextRequest, name: string) => {
  const value = request.headers.get(name);
  try { return value ? decodeURIComponent(value) : ""; } catch { return value ?? ""; }
};

export async function recordVisit(request: NextRequest, acknowledged: boolean) {
  // Only the live site records visits; local and preview runs never touch the log.
  if (!process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_ENV !== "production") return;
  const userAgent = (request.headers.get("user-agent") ?? "").slice(0, 400);
  const visit: Visit = {
    at: new Date().toISOString(),
    city: header(request, "x-vercel-ip-city"),
    region: header(request, "x-vercel-ip-country-region"),
    country: header(request, "x-vercel-ip-country"),
    device: describeDevice(userAgent),
    userAgent,
    acknowledged,
  };
  const id = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  await put(`visits/${id}.json`, JSON.stringify(visit), { access: "private", contentType: "application/json", addRandomSuffix: false });
}

export async function readVisits(limit = 200): Promise<Visit[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  const { blobs } = await list({ prefix: "visits/", limit: 1000 });
  const newest = blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt)).slice(0, limit);
  const visits = await Promise.all(newest.map(async blob => {
    const result = await get(blob.pathname, { access: "private" });
    if (!result || result.statusCode !== 200) return null;
    try { return await new Response(result.stream).json() as Visit; } catch { return null; }
  }));
  return visits.filter((v): v is Visit => v !== null);
}
