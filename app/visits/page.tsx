import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createHash, timingSafeEqual } from "node:crypto";
import { readVisits } from "@/lib/visits";

// Owner-only log of who unlocked the site after ticking the acknowledgement box.
// Open it with /visits?key=YOUR_KEY. A wrong or missing key returns a plain 404.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Visits", robots: { index: false, follow: false } };

function keyMatches(key: string | undefined) {
  const expected = process.env.OWNER_KEY_SHA256;
  if (!key || !expected || key.length > 200) return false;
  const actual = createHash("sha256").update(key).digest();
  const wanted = Buffer.from(expected, "hex");
  return wanted.length === actual.length && timingSafeEqual(actual, wanted);
}

const when = (iso: string) => new Date(iso).toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "medium", timeStyle: "short" });

export default async function Visits({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const { key } = await searchParams;
  if (!keyMatches(key)) notFound();
  const visits = await readVisits();
  return (
    <main className="visits">
      <h1>Unlocks</h1>
      <p className="visits-sub">{visits.length === 0 ? "Nobody has ticked the box and entered yet." : `${visits.length} ${visits.length === 1 ? "person has" : "people have"} ticked the box and entered. Times are Pacific.`}</p>
      <ol>
        {visits.map(v => (
          <li key={v.at + v.userAgent}>
            <b>{when(v.at)}</b>
            <span>{[v.city, v.region, v.country].filter(Boolean).join(", ") || "Location unknown"}</span>
            <span>{v.device}</span>
            <small>{v.userAgent}</small>
          </li>
        ))}
      </ol>
    </main>
  );
}
