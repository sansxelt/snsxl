"use client";

import { useEffect } from "react";

// Runs the page as a deck: reveals each slide as it arrives, counts numbers up,
// keeps the slide counter current, and lets arrow keys / space / page keys step between slides.
export default function Presentation() {
  useEffect(() => {
    document.title = "Nishanth Dasari | Portfolio";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const slides = Array.from(document.querySelectorAll<HTMLElement>(".slide"));
    const hudChapter = document.querySelector<HTMLElement>(".hud-chapter");
    const hudTotal = document.querySelector<HTMLElement>(".hud-count");
    const hudBar = document.querySelector<HTMLElement>(".hud-bar i");
    const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(".topbar-nav a"));
    const pill = document.querySelector<HTMLElement>(".topbar-pill");
    const topProgress = document.querySelector<HTMLElement>(".topbar-progress i");
    // Slide the highlight pill under whichever chapter link is active.
    function placePill() {
      const active = navLinks.find(a => a.classList.contains("is-active"));
      if (!pill) return;
      if (!active) { pill.style.opacity = "0"; return; }
      pill.style.opacity = "1"; pill.style.width = `${active.offsetWidth}px`; pill.style.transform = `translateX(${active.offsetLeft}px)`;
    }
    const pad = (n: number) => String(n).padStart(2, "0");
    if (hudTotal) hudTotal.innerHTML = `<b>01</b> / ${pad(slides.length)}`;
    const hudCount = document.querySelector<HTMLElement>(".hud-count b");

    slides.forEach(slide => slide.querySelectorAll<HTMLElement>(".r").forEach((el, i) => { el.style.transitionDelay = `${i * 110}ms`; }));

    const format = (v: number, dec: number) => dec ? v.toFixed(dec) : Math.round(v).toLocaleString("en-US");
    function countUp(slide: HTMLElement) {
      slide.querySelectorAll<HTMLElement>(".count").forEach(el => {
        const to = Number(el.dataset.to), dec = Number(el.dataset.dec || 0);
        if (reduce) { el.textContent = format(to, dec); return; }
        const start = performance.now(), dur = 1600;
        const step = (now: number) => {
          const t = Math.min((now - start) / dur, 1), e = 1 - Math.pow(1 - t, 4);
          el.textContent = format(to * e, dec);
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }

    // Count toward the recorded total without presenting invented monthly history.
    let visitsRun = 0;
    function resetVisits(el: HTMLElement, date: HTMLElement | null) {
      visitsRun++;
      el.classList.remove("compressed");
      el.textContent = "11B+";
      if (date) date.textContent = "Recorded total";
    }
    function countVisits(slide: HTMLElement) {
      const el = slide.querySelector<HTMLElement>(".visits"), date = slide.querySelector<HTMLElement>(".visit-date");
      if (!el) return;
      resetVisits(el, date);
      const run = visitsRun, to = Number(el.dataset.to);
      const finish = () => {
        if (run !== visitsRun) return;
        el.textContent = "11B+";
        el.classList.add("compressed");
      };
      if (reduce) { finish(); return; }
      const start = performance.now(), duration = 2000;
      const step = (now: number) => {
        if (run !== visitsRun) return;
        const t = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - t, 4))).toLocaleString("en-US");
        if (t < 1) requestAnimationFrame(step);
        else window.setTimeout(finish, 900);
      };
      requestAnimationFrame(step);
    }

    // Hold every reveal until the 3D scene has faded up from black (or a fallback timeout), so the
    // home page arrives in order: black, scene, then the bar, text and cards.
    let ready = reduce;
    const pending = new Set<HTMLElement>();
    const onReady = () => {
      if (ready) return;
      ready = true;
      document.documentElement.classList.add("is-ready");
      pending.forEach(slide => { slide.classList.add("is-in"); countUp(slide); reveal.unobserve(slide); });
      pending.clear();
    };
    if (reduce) document.documentElement.classList.add("is-ready");
    const onLive = () => window.setTimeout(onReady, 700);
    window.addEventListener("scene-live", onLive, { once: true });
    const fallback = window.setTimeout(onReady, 3200);

    const reveal = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) { pending.delete(entry.target as HTMLElement); continue; }
        if (!ready) { pending.add(entry.target as HTMLElement); continue; }
        const slide = entry.target as HTMLElement;
        slide.classList.add("is-in"); countUp(slide); reveal.unobserve(slide);
      }
    }, { threshold: .25 });
    slides.forEach(s => reveal.observe(s));

    // Replay the visits counter every time its slide comes into view; reset it once it's gone.
    const visitsSlide = document.querySelector<HTMLElement>(".visits")?.closest<HTMLElement>(".slide");
    let visitsShown = false;
    const visitsWatch = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio >= .5 && !visitsShown && ready) { visitsShown = true; countVisits(entry.target as HTMLElement); }
      else if (entry.intersectionRatio === 0 && visitsShown) {
        visitsShown = false;
        const el = entry.target.querySelector<HTMLElement>(".visits");
        if (el) resetVisits(el, entry.target.querySelector<HTMLElement>(".visit-date"));
      }
    }, { threshold: [0, .5] });
    if (visitsSlide) visitsWatch.observe(visitsSlide);

    let current = 0;
    function update() {
      const mid = window.innerHeight * .5;
      let idx = 0;
      slides.forEach((s, i) => { if (s.getBoundingClientRect().top <= mid) idx = i; });
      current = idx;
      const chapter = slides[idx].closest<HTMLElement>("[data-chapter]")?.dataset.chapter ?? "";
      if (hudChapter && hudChapter.textContent !== chapter) hudChapter.textContent = chapter;
      const chapterId = slides[idx].closest<HTMLElement>("section.chapter")?.id;
      navLinks.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === `#${chapterId}`));
      placePill();
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (topProgress) topProgress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      if (hudCount) hudCount.textContent = pad(idx + 1);
      if (hudBar) hudBar.style.transform = `scaleX(${(idx + 1) / slides.length})`;
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", placePill);

    // Travelling between slides or chapters: a real, eased flight whose length scales with distance,
    // so the camera passes through the worlds at a readable pace. Any wheel or touch cancels it.
    let travel = 0;
    const easeInOut = (t: number) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const setTravelling = (on: boolean) => window.dispatchEvent(new CustomEvent("scene-travel", { detail: on }));
    function jumpTo(target: HTMLElement) {
      const from = window.scrollY, to = Math.min(target.getBoundingClientRect().top + window.scrollY, document.documentElement.scrollHeight - window.innerHeight);
      const distance = Math.abs(to - from);
      if (distance < 2) return;
      if (reduce) { window.scrollTo(0, to); return; }
      const duration = Math.min(5200, Math.max(1600, 1400 + distance / window.innerHeight * 420));
      const run = ++travel, began = performance.now();
      const root = document.documentElement;
      root.style.scrollBehavior = "auto"; setTravelling(true);
      const stop = () => { if (run !== travel) return; travel++; root.style.scrollBehavior = ""; setTravelling(false); window.removeEventListener("wheel", stop); window.removeEventListener("touchstart", stop); };
      window.addEventListener("wheel", stop, { passive: true, once: true });
      window.addEventListener("touchstart", stop, { passive: true, once: true });
      const step = (now: number) => {
        if (run !== travel) return;
        const p = Math.min((now - began) / duration, 1);
        window.scrollTo(0, from + (to - from) * easeInOut(p));
        if (p < 1) requestAnimationFrame(step); else stop();
      };
      requestAnimationFrame(step);
    }
    function onClick(e: MouseEvent) {
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const target = document.querySelector<HTMLElement>(link.getAttribute("href")!);
      if (!target) return;
      e.preventDefault();
      link.blur();
      jumpTo(target.classList.contains("slide") ? target : target.querySelector<HTMLElement>(".slide") ?? target);
    }
    document.addEventListener("click", onClick);

    function go(delta: number) {
      jumpTo(slides[Math.min(Math.max(current + delta, 0), slides.length - 1)]);
    }
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target as HTMLElement)?.closest("input, textarea, button, select, a, [contenteditable=true]")) return;
      if (["ArrowDown", "PageDown", " "].includes(e.key) && !e.shiftKey) { e.preventDefault(); go(1); }
      else if (["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) { e.preventDefault(); go(-1); }
      else if (e.key === "Home") { e.preventDefault(); jumpTo(slides[0]); }
      else if (e.key === "End") { e.preventDefault(); jumpTo(slides[slides.length - 1]); }
    }
    window.addEventListener("keydown", onKey);
    return () => { window.clearTimeout(fallback); window.removeEventListener("scene-live", onLive); reveal.disconnect(); visitsWatch.disconnect(); window.removeEventListener("scroll", update); window.removeEventListener("resize", placePill); window.removeEventListener("keydown", onKey); document.removeEventListener("click", onClick); };
  }, []);
  return null;
}
