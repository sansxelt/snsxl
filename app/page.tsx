import { cookies } from "next/headers";
import AccessGate from "./AccessGate";
import { verifyAccessToken } from "@/lib/auth";
import { portfolioMarkup } from "./portfolio-markup";
import Presentation from "./Presentation";
import Scene from "./Scene";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

async function isAuthorized() {
  return verifyAccessToken((await cookies()).get("portfolio_access")?.value);
}

export async function generateMetadata(): Promise<Metadata> {
  return await isAuthorized()
    ? { title: "Unlocked", description: "Founder of Foremake, the company behind Vraelis and Overlym." }
    : { title: "Locked", description: "Private portfolio. Access is shared privately with professional contacts and reviewers." };
}

function ageLine(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(now);
  const value = (key: string) => Number(parts.find(p => p.type === key)?.value);
  const birthdayPassed = value("month") > 10 || (value("month") === 10 && value("day") >= 21);
  const age = value("year") - 2010 - (birthdayPassed ? 0 : 1);
  return `I’m ${age}.`;
}

export default async function Home() {
  if (!await isAuthorized()) return <AccessGate />;
  return <><Scene /><div dangerouslySetInnerHTML={{ __html: portfolioMarkup.replace("{{AGE_LINE}}", ageLine()) }} /><Presentation /></>;
}
