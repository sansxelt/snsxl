"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function AccessGate() {
  const [password, setPassword] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [opening, setOpening] = useState(false);
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    input.current?.focus();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password || !acknowledged || busy || opening) return;
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch("/api/access", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, acknowledged }), credentials: "same-origin", cache: "no-store",
      });
      if (!response.ok) {
        setStatus(response.status === 401 ? "Incorrect password. Try again." : "Couldn’t unlock right now. Try again.");
        setPassword("");
        input.current?.focus();
        return;
      }
      setPassword("");
      setOpening(true);
      const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 550;
      timer.current = setTimeout(() => router.refresh(), delay);
    } catch {
      setStatus("Couldn’t connect. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return <main className={`gate${opening ? " is-leaving" : ""}`} aria-label="Private portfolio">
    <form className="gate-inner" onSubmit={submit} aria-busy={busy}>
      <h1>This portfolio is private.</h1>
      <label className="sr-only" htmlFor="portfolio-password">Password</label>
      <div className="gate-field">
        <input ref={input} id="portfolio-password" name="password" type="password" autoComplete="current-password" autoCapitalize="none" spellCheck={false} placeholder="Password" value={password} onChange={event => setPassword(event.target.value)} aria-describedby="access-status" required disabled={busy || opening} />
        <button type="submit" disabled={!password || !acknowledged || busy || opening} aria-label="Unlock">
          {busy ? <span className="gate-spinner" aria-hidden="true" /> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </button>
      </div>
      <label className={`gate-check${acknowledged ? " is-on" : ""}`}>
        <input type="checkbox" checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} required disabled={busy || opening} />
        <span className="gate-box" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
        <span>I understand this applicant has not yet finished high school or an equivalent.</span>
      </label>
      <p className="gate-status" id="access-status" role="status">{status}</p>
    </form>
  </main>;
}
