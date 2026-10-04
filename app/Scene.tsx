"use client";

import { useEffect, useRef } from "react";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (x: number) => Math.min(Math.max(x, 0), 1);
const CHAPTERS = ["now", "proof", "path", "me"];
// Flat at both ends of a segment, steep in the middle: the camera rests on each slide and travels between them.
const hold = (t: number) => { const u = clamp((t - .18) / .64); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };

type Worlds = ReturnType<typeof import("./worlds")["createWorlds"]>;

// Live 3D backdrop. Fades up from black once the first frame is drawn.
export default function Scene() {
  const scrim = useRef<HTMLDivElement>(null);
  const gl = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let vw = 0, vh = 0, stops: number[] = [], zKeys: number[] = [], ranges: number[] = [];
    let smooth = window.scrollY, raf = 0, last = performance.now(), disposed = false, shown = false;
    let worlds: Worlds | null = null;

    function measure() {
      vw = window.innerWidth; vh = window.innerHeight;
      // One camera stop per slide. Each chapter's slides share its world's stretch of the flight path,
      // so every slide gets its own shot; the first slide of a chapter sits just past that chapter's ring.
      const slides = Array.from(document.querySelectorAll<HTMLElement>(".slide"));
      const topOf = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;
      stops = []; zKeys = [];
      slides.forEach((slide, i) => {
        const chapter = slide.closest<HTMLElement>("section.chapter");
        const c = chapter ? CHAPTERS.indexOf(chapter.id) : -1;
        const siblings = chapter ? Array.from(chapter.querySelectorAll(".slide")) : [slide];
        const k = siblings.indexOf(slide);
        const [z0, z1] = c < 0 ? [ranges[0], ranges[1]] : [ranges[c + 1], ranges[c + 2]];
        stops.push(i === 0 ? 0 : topOf(slide) - vh * .3);
        const start = z0 - 10; // just through the ring, not parked inside it
        zKeys.push(c < 0 ? z0 : start + (z1 - start) * k / siblings.length);
      });
      stops.push(Math.max(document.documentElement.scrollHeight - vh, stops[stops.length - 1] + 1));
      zKeys.push(ranges[ranges.length - 1]);
      worlds?.resize(vw, vh);
    }
    // During a guided flight the camera follows the scroll continuously instead of resting on each slide.
    let travelling = false, travelMix = 0, camZ = NaN, camShot = 0;
    const onTravel = (e: Event) => { travelling = (e as CustomEvent<boolean>).detail; };
    const onPointer = (e: PointerEvent) => worlds?.pointer(e.clientX / vw * 2 - 1, e.clientY / vh * 2 - 1);

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, .1); last = now;
      smooth = lerp(smooth, window.scrollY, 1 - Math.exp(-dt * 6));
      let i = 0; while (i < stops.length - 2 && smooth > stops[i + 1]) i++;
      // Hold while a slide is being read, then move decisively to the next shot.
      const raw = clamp((smooth - stops[i]) / Math.max(stops[i + 1] - stops[i], 1));
      // Ease between "rest on each slide" and "follow the flight" instead of switching in one frame,
      // then smooth the camera's distance and framing so nothing can jump between frames.
      travelMix = lerp(travelMix, travelling ? 1 : 0, 1 - Math.exp(-dt * 3));
      const t = lerp(hold(raw), raw, travelMix);
      const targetZ = lerp(zKeys[i], zKeys[i + 1], t), targetShot = i + t;
      const follow = 1 - Math.exp(-dt * 4.5);
      camZ = Number.isNaN(camZ) ? targetZ : lerp(camZ, targetZ, follow);
      camShot = lerp(camShot, targetShot, follow);
      worlds!.render(camZ, now / 1000, camShot);
      scrim.current!.style.opacity = String(clamp(smooth / (vh * .7)) * .5);
      if (!shown) { shown = true; gl.current!.classList.add("is-live"); window.dispatchEvent(new Event("scene-live")); }
      raf = requestAnimationFrame(frame);
    }

    import("./worlds").then(mod => {
      if (disposed) return;
      try { worlds = mod.createWorlds(gl.current!, window.innerWidth <= 600 || matchMedia("(pointer: coarse)").matches); }
      catch { return; }
      ranges = [mod.START_Z, 0, ...mod.PORTALS, mod.END_Z];
      measure();
      window.addEventListener("resize", measure);
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("scene-travel", onTravel);
      raf = requestAnimationFrame(frame);
    });
    const ro = new ResizeObserver(() => measure()); ro.observe(document.body);
    return () => {
      disposed = true; cancelAnimationFrame(raf); ro.disconnect();
      window.removeEventListener("resize", measure); window.removeEventListener("pointermove", onPointer); window.removeEventListener("scene-travel", onTravel);
      worlds?.dispose();
    };
  }, []);

  return <div className="scene" aria-hidden="true">
    <canvas className="scene-gl" ref={gl} />
    <div className="scene-scrim" ref={scrim} />
  </div>;
}
